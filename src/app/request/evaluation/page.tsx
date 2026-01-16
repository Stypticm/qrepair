"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion } from "framer-motion";

import { Page } from "@/components/Page";
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/authStore";
import { init } from '@telegram-apps/sdk';
import { getPictureUrl } from "@/core/lib/assets";
import { useFormData } from '@/hooks/usePersistentState';
import { calculatePriceRange } from "@/core/lib/priceCalculation";
import { getBasePriceWithFallback } from '@/core/lib/basePriceUtils';
import { EvaluationContinueButton } from '@/components/ContinueButton';

// Типы для безопасности
interface WearValues {
  display_front: number;
  display_back: number;
  back_camera: number;
  battery: number;
}

interface PriceRange {
  min: number;
  max: number;
  midpoint: number;
}

interface EvaluationState {
  category: string;
  condition: string;
  penalty: number;
}

// iPhone-специфичные размеры экранов
const IPHONE_BREAKPOINTS = {
  SE: 375,      // iPhone SE
  MINI: 375,    // iPhone 12/13 mini
  STANDARD: 390, // iPhone 12/13/14
  PLUS: 428,    // iPhone 12/13/14 Plus
  PRO_MAX: 430  // iPhone 12/13/14 Pro Max
} as const;

// Адаптивные размеры для iPhone
const getImageSize = (screenWidth: number): number => {
  if (screenWidth <= IPHONE_BREAKPOINTS.SE) return 100;
  if (screenWidth <= IPHONE_BREAKPOINTS.STANDARD) return 110;
  if (screenWidth <= IPHONE_BREAKPOINTS.PLUS) return 120;
  return 130;
};

// Константы для условий
const CONDITION_LABELS = {
  PERFECT: 'Идеальное',
  GOOD: 'Хорошее', 
  FAIR: 'Удовлетворительное',
  POOR: 'Плохое'
} as const;

const WEAR_LABELS = {
  NEW: 'Новый',
  VERY_GOOD: 'Очень хорошее',
  SCRATCHES: 'Заметные царапины',
  CRACKS: 'Трещины'
} as const;

const BATTERY_LEVELS = {
  HIGH: '95%',
  MEDIUM_HIGH: '90%',
  MEDIUM: '85%',
  LOW: '75%'
} as const;

// Утилиты для преобразования значений
const getConditionLabel = (val: number): string => {
  if (val <= 25) return CONDITION_LABELS.PERFECT;
  if (val <= 50) return CONDITION_LABELS.GOOD;
  if (val <= 75) return CONDITION_LABELS.FAIR;
  return CONDITION_LABELS.POOR;
};

const getWearLabel = (val: number): string => {
  if (val <= 25) return WEAR_LABELS.NEW;
  if (val <= 50) return WEAR_LABELS.VERY_GOOD;
  if (val <= 75) return WEAR_LABELS.SCRATCHES;
  return WEAR_LABELS.CRACKS;
};

const getBatteryLevel = (val: number): string => {
  if (val <= 25) return BATTERY_LEVELS.HIGH;
  if (val <= 50) return BATTERY_LEVELS.MEDIUM_HIGH;
  if (val <= 75) return BATTERY_LEVELS.MEDIUM;
  return BATTERY_LEVELS.LOW;
};

const getConditionColor = (val: number): string => {
  if (val <= 25) return 'bg-green-100 text-green-800 border-green-200';
  if (val <= 50) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (val <= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

// Компонент слайдера износа
interface WearSliderProps {
  category: string;
  images: string[];
  value: number;
  onValueChange: (value: number) => void;
  imageSize: number;
}

const WearSlider = memo(function WearSlider({ 
  category, 
  images, 
  value, 
  onValueChange, 
  imageSize 
}: WearSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const { baseIdx, nextIdx, blend } = useMemo(() => {
    const scaled = (value / 100) * (images.length - 1);
    const i0 = Math.floor(scaled);
    const i1 = Math.min(images.length - 1, i0 + 1);
    const t = scaled - i0;
    return { baseIdx: i0, nextIdx: i1, blend: t };
  }, [value, images.length]);

  const setValueFromPointer = useCallback((clientY: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, ratio));
    onValueChange(Math.round(clamped * 100));
  }, [onValueChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    setValueFromPointer(e.clientY);
  }, [setValueFromPointer]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setValueFromPointer(e.clientY);
  }, [setValueFromPointer]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
  }, []);

  const categoryLabels = {
    display_front: 'Передняя панель',
    display_back: 'Задняя панель', 
    back_camera: 'Задняя камера',
    battery: 'Износ батареи'
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl p-4 border border-white/40 bg-white/70 backdrop-blur-md shadow-[0_30px_60px_-30px_rgba(2,6,23,0.25)]">
      <div
        className="relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 flex-shrink-0 flex items-center justify-center p-2"
        style={{ width: imageSize, height: imageSize }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 1 - blend }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Image
            src={getPictureUrl(`${images[baseIdx]}.png`) || '/display_front_new.png'}
            alt={`${category} condition base`}
            width={imageSize}
            height={imageSize}
            className="object-contain max-w-full max-h-full"
            priority
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: blend }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Image
            src={getPictureUrl(`${images[nextIdx]}.png`) || '/display_front_new.png'}
            alt={`${category} condition next`}
            width={imageSize}
            height={imageSize}
            className="object-contain max-w-full max-h-full"
            priority
          />
        </motion.div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </div>
          <div className="text-base font-semibold text-slate-900 leading-tight break-words">
            {getConditionLabel(value)}
          </div>
          <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getConditionColor(value)}`}>
            {value}%
          </div>
        </div>
        <div
          ref={sliderRef}
          className="relative h-24 w-10 rounded-full bg-gradient-to-b from-white/70 to-white/30 border border-white/60 shadow-inner select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="absolute left-1/2 top-2 -translate-x-1/2 h-[84px] w-[6px] rounded-full bg-slate-200 overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-slate-900 to-slate-700 rounded-full"
              style={{ height: `${value}%`, transition: 'height 200ms ease-out' }}
            />
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.3)] pointer-events-none z-10"
            style={{ top: `calc(${value}% - 14px)` }}
          />
          <input
            aria-label="wear"
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onValueChange(parseInt(e.target.value))}
            className="slider-v pointer-events-none absolute inset-0 w-full h-full opacity-0"
            data-orient="vertical"
          />
        </div>
      </div>
    </div>
  );
});

// Компонент слайдеров оценки
interface EvaluationSlidersProps {
  wearValues: WearValues;
  setWearValues: (values: WearValues) => void;
  setCurrentEvaluation: (evaluation: EvaluationState) => void;
  setPriceRange: (range: PriceRange) => void;
  setPrice: (price: number) => void;
  basePrice: number;
  modelName: string;
}

const EvaluationSliders = memo(function EvaluationSliders({ 
  wearValues, 
  setWearValues, 
  setCurrentEvaluation, 
  setPriceRange, 
  setPrice, 
  basePrice, 
  modelName 
}: EvaluationSlidersProps) {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : IPHONE_BREAKPOINTS.STANDARD;
  const imageSize = getImageSize(screenWidth);

  const categories = useMemo(() => [
    { id: 'display_front', images: ['display_front_new', 'display_front', 'display_front_have_scratches', 'display_front_scratches'] },
    { id: 'display_back', images: ['display_back_new', 'display_back', 'display_back_have_scratches', 'display_back_scratches'] },
    { id: 'back_camera', images: ['back_camera_new', 'back_camera', 'back_camera_have_scratches', 'back_camera_scratches'] },
    { id: 'battery', images: ['battery_95', 'battery_90', 'battery_85', 'battery_75'] },
  ], []);

  const handleValueChange = useCallback((categoryId: string, val: number) => {
    const nextWear = { ...wearValues, [categoryId]: val };
    setWearValues(nextWear);

    setCurrentEvaluation({ 
      category: categoryId, 
      condition: getWearLabel(val), 
      penalty: val 
    });

    const range = calculatePriceRange(
      basePrice,
      modelName,
      {
        front: getWearLabel(nextWear.display_front),
        back: getWearLabel(nextWear.display_back),
      },
      {
        backCamera: getWearLabel(nextWear.back_camera),
        battery: getBatteryLevel(nextWear.battery),
      }
    );
    setPriceRange(range);
    setPrice(range.midpoint);
  }, [wearValues, setWearValues, setCurrentEvaluation, setPriceRange, setPrice, basePrice, modelName]);

  return (
    <div className="space-y-4">
      {categories.map((c) => (
        <WearSlider
          key={c.id}
          category={c.id}
          images={c.images}
          value={wearValues[c.id as keyof WearValues]}
          onValueChange={(val) => handleValueChange(c.id, val)}
          imageSize={imageSize}
        />
      ))}
    </div>
  );
});

// Основной компонент страницы
export default function EvaluationPage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { 
    telegramId, 
    modelname, 
    setUserEvaluation, 
    setDamagePercent, 
    setPrice, 
    setCurrentStep 
  } = useAppStore();
  
  const { wearValues, priceRange, saveToDatabase } = useFormData();
  
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationState | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Отладка состояния
  useEffect(() => {
    console.log('🔍 Evaluation page state:', {
      wearValues: wearValues.state,
      priceRange: priceRange.state,
      basePrice,
      currentEvaluation,
      submitting,
      isNavigating
    });
  }, [wearValues.state, priceRange.state, basePrice, currentEvaluation, submitting, isNavigating]);

  // Отключение вертикальных свайпов для Telegram
  useEffect(() => {
    let destroy: (() => void) | undefined;
    
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        init();
        const wa: any = (window as any).Telegram?.WebApp;
        try {
          // Отключаем только свайп вниз для закрытия приложения (как в болванке)
          // Это НЕ блокирует горизонтальные и вертикальные свайпы внутри приложения
          if (typeof wa.disableVerticalSwipes === 'function') {
            wa.disableVerticalSwipes();
          }
          // Для мобильных - expand
          const platform = wa?.platform;
          const isMobilePlatform = platform === 'android' || platform === 'ios';
          if (isMobilePlatform) {
            try { wa.expand(); } catch {}
          }
          try { wa.enableClosingConfirmation(); } catch {}
          destroy = () => {
            // Восстанавливаем свайп вниз при размонтировании (опционально)
            try {
              if (typeof wa?.enableVerticalSwipes === 'function') {
                wa.enableVerticalSwipes();
              }
            } catch {}
          }
        } catch {}
      }
    } catch {}
    
    // УБРАЛИ блокировку всех свайпов - теперь свайпы работают внутри приложения
    // Оставляем только базовые стили для Telegram WebApp
    const prevOverflow = document.body.style.overflow;
    const prevHeight = document.body.style.height;
    document.body.style.overflow = 'auto';
    document.body.style.height = '100dvh';
    
    return () => {
      try { destroy?.(); } catch {}
      document.body.style.overflow = prevOverflow;
      document.body.style.height = prevHeight;
    };
  }, []);

  // Установка текущего шага
  useEffect(() => {
    setCurrentStep('evaluation');
  }, [setCurrentStep]);

  // Загрузка базовой цены с fallback механизмом
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadBasePrice = async () => {
      const basePrice = await getBasePriceWithFallback(modelname);
      if (basePrice) {
        setBasePrice(basePrice);
      }
    };
    
    loadBasePrice();
  }, [modelname]);

  // Сохраняем basePrice в sessionStorage для следующих страниц
  useEffect(() => {
    if (basePrice && typeof window !== "undefined") {
      sessionStorage.setItem('basePrice', basePrice.toString());
      console.log('💰 Сохранена базовая цена для следующих страниц:', basePrice);
    }
  }, [basePrice]);

  // Автоматическое сохранение при изменении данных
  useEffect(() => {
    if (wearValues.state && Object.values(wearValues.state).some(v => typeof v === 'number' && v > 0)) {
      const timeoutId = setTimeout(() => {
        saveToDatabase();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [wearValues.state, saveToDatabase]);

  // Обработка продолжения
  const handleContinue = useCallback(async () => {
    console.log('🔍 handleContinue called:', {
      currentEvaluation,
      priceRange: priceRange.state,
      submitting,
      isNavigating,
      basePrice
    });

    // Если нет priceRange, создаем дефолтный
    let finalPriceRange = priceRange.state;
    if (!finalPriceRange && basePrice) {
      finalPriceRange = {
        min: Math.round(basePrice * 0.7),
        max: Math.round(basePrice * 0.9),
        midpoint: Math.round(basePrice * 0.8)
      };
      console.log('🔧 Using default price range:', finalPriceRange);
    }

    if (!finalPriceRange) {
      console.log('❌ No price range available');
      alert('Ошибка: не удалось определить цену. Попробуйте ещё раз.');
      return;
    }

    setSubmitting(true);
    setIsNavigating(true);
    
    // Используем данные из currentEvaluation или создаем дефолтные
    const evaluation = currentEvaluation || {
      category: 'general',
      condition: 'Хорошее',
      penalty: 20
    };
    
    setUserEvaluation(evaluation.condition);
    setDamagePercent(evaluation.penalty);

    try {
      // Сохраняем данные в БД через useFormData
      await saveToDatabase();
      
      // Сохраняем оценку через API
      const response = await fetch("/api/request/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          userEvaluation: evaluation.condition,
          damagePercent: evaluation.penalty,
          price: finalPriceRange.midpoint,
          priceRange: finalPriceRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Evaluation saved successfully:', result);

      // Переходим на страницу submit сразу после сохранения
      router.push("/request/device-functions");
    } catch (error) {
      console.error("❌ Error saving evaluation:", error);
      // Показываем пользователю ошибку, но всё равно переходим
      alert("Ошибка при сохранении оценки. Попробуйте ещё раз.");
      router.push("/request/device-functions");
    } finally {
      setSubmitting(false);
      setIsNavigating(false);
    }
  }, [currentEvaluation, priceRange.state, saveToDatabase, setUserEvaluation, setDamagePercent, telegramId, router, basePrice]);

  return (
    <Page back={goBack}>
      <div className="min-h-screen overflow-hidden">
        <div className="max-w-md mx-auto p-2">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Оценка <br />состояния</h1>
          </div>

          <EvaluationSliders 
            wearValues={wearValues.state}
            setWearValues={wearValues.setState}
            setCurrentEvaluation={setCurrentEvaluation}
            setPriceRange={priceRange.setState}
            setPrice={setPrice}
            basePrice={basePrice ?? 0}
            modelName={modelname ?? 'iPhone'}
          />
        </div>


        {/* Индикатор навигации */}
        {isNavigating && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center">
              <Image 
                src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} 
                alt="Загрузка" 
                width={192} 
                height={192} 
                className="object-contain rounded-2xl" 
              />
              <p className="mt-4 text-lg font-semibold text-gray-700">Переходим для проверки функций…</p>
            </div>
          </div>
        )}
        
        {/* Кнопка продолжения */}
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <EvaluationContinueButton
              disabled={submitting}
              onClick={async () => {
                console.log('🔍 Continue button clicked:', {
                  priceRange: priceRange.state,
                  submitting,
                  currentEvaluation,
                  wearValues: wearValues.state
                });
                
                // Если нет priceRange, но есть wearValues, создаем базовый диапазон
                if (!priceRange.state && wearValues.state && basePrice) {
                  const defaultRange = {
                    min: Math.round(basePrice * 0.7),
                    max: Math.round(basePrice * 0.9),
                    midpoint: Math.round(basePrice * 0.8)
                  };
                  priceRange.setState(defaultRange);
                  console.log('🔧 Created default price range:', defaultRange);
                }
                
                // Сохраняем данные и переходим
                await handleContinue();
              }}
              isLoading={submitting}
            >
              Продолжить
            </EvaluationContinueButton>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}