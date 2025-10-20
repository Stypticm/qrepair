"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion } from "framer-motion";

import { Page } from "@/components/Page";
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/stores/authStore";
import { init, swipeBehavior } from '@telegram-apps/sdk';
import { getPictureUrl } from "@/core/lib/assets";
import { calculatePriceRange, type DeviceConditions, type AdditionalConditions } from "@/core/lib/priceCalculation";

interface WearSliderProps {
  category: string;
  images: string[];
  value: number;
  onValueChange: (value: number) => void;
  imageSize: number;
}

function WearSlider({ category, images, value, onValueChange, imageSize }: WearSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const { baseIdx, nextIdx, blend } = useMemo(() => {
    const scaled = (value / 100) * (images.length - 1);
    const i0 = Math.floor(scaled);
    const i1 = Math.min(images.length - 1, i0 + 1);
    const t = scaled - i0; // 0..1
    return { baseIdx: i0, nextIdx: i1, blend: t };
  }, [value, images.length]);

  const getConditionLabel = (val: number) => {
    if (val <= 25) return 'Идеальное';
    if (val <= 50) return 'Хорошее';
    if (val <= 75) return 'Удовлетворительное';
    return 'Плохое';
  };

  const getConditionColor = (val: number) => {
    if (val <= 25) return 'bg-green-100 text-green-800 border-green-200';
    if (val <= 50) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (val <= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const currentImage = images[baseIdx];
  const nextImage = images[nextIdx];

  const setValueFromPointer = (clientY: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Top-start: 0% вверху, 100% внизу
    const ratio = (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, ratio));
    onValueChange(Math.round(clamped * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    setValueFromPointer(e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setValueFromPointer(e.clientY);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
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
          {category === 'back_camera' ? (
            <Image
              src={getPictureUrl(`${currentImage}.png`) || '/display_front_new.png'}
              alt={`${category} condition base`}
              width={imageSize}
              height={imageSize}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <Image
              src={getPictureUrl(`${currentImage}.png`) || '/display_front_new.png'}
              alt={`${category} condition base`}
              width={imageSize - 28}
              height={imageSize - 28}
              className="object-contain max-w-full max-h-full"
              priority
            />
          )}
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: blend }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {category === 'back_camera' ? (
            <Image
              src={getPictureUrl(`${nextImage}.png`) || '/display_front_new.png'}
              alt={`${category} condition next`}
              width={imageSize}
              height={imageSize}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <Image
              src={getPictureUrl(`${nextImage}.png`) || '/display_front_new.png'}
              alt={`${category} condition next`}
              width={imageSize - 28}
              height={imageSize - 28}
              className="object-contain max-w-full max-h-full"
              priority
            />
          )}
        </motion.div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{
            category === 'display_front' ? 'Передняя панель' :
            category === 'display_back' ? 'Задняя панель' :
            category === 'back_camera' ? 'Задняя камера' :
            'Износ батареи'
          }</div>
          <div className="text-base font-semibold text-slate-900 leading-tight break-words">{getConditionLabel(value)}</div>
          <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getConditionColor(value)}`}>{value}%</div>
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
}

interface EvaluationSlidersProps {
  wearValues: {
    display_front: number;
    display_back: number;
    back_camera: number;
    battery: number;
  };
  setWearValues: (values: any) => void;
  setCurrentEvaluation: (evaluation: any) => void;
  setPriceRange: (range: any) => void;
  setPrice: (price: number) => void;
  basePrice: number;
  modelName: string;
}

function EvaluationSliders({ 
  wearValues, 
  setWearValues, 
  setCurrentEvaluation, 
  setPriceRange, 
  setPrice, 
  basePrice, 
  modelName 
}: EvaluationSlidersProps) {
  const getBlockDimensions = (screenWidth: number, screenHeight: number = 844) => {
    const heightMultiplier = screenHeight > 900 ? 0.7 : screenHeight > 850 ? 0.8 : 1.0;
    if (screenWidth <= 375) return { imageSize: 100 };
    if (screenWidth <= 390) return { imageSize: 110 };
    if (screenWidth <= 420) return { imageSize: 120 };
    return { imageSize: 130 };
  };
  
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 844;
  const { imageSize } = getBlockDimensions(screenWidth, screenHeight);

  const categories = [
    { id: 'display_front', images: ['display_front_new', 'display_front', 'display_front_have_scratches', 'display_front_scratches'] },
    { id: 'display_back', images: ['display_back_new', 'display_back', 'display_back_have_scratches', 'display_back_scratches'] },
    { id: 'back_camera', images: ['back_camera_new', 'back_camera', 'back_camera_have_scratches', 'back_camera_scratches'] },
    { id: 'battery', images: ['battery_95', 'battery_90', 'battery_85', 'battery_75'] },
  ];

  const wearToLabel = (val: number): string => {
    if (val <= 25) return 'Новый';
    if (val <= 50) return 'Очень хорошее';
    if (val <= 75) return 'Заметные царапины';
    return 'Трещины';
  };
  
  const wearToBattery = (val: number): string => {
    if (val <= 25) return '95%';
    if (val <= 50) return '90%';
    if (val <= 75) return '85%';
    return '75%';
  };

  const handleValueChange = (categoryId: string, val: number) => {
    // Обновляем значение конкретной категории
    const nextWear = { ...wearValues, [categoryId]: val };
    setWearValues(nextWear);

    // Обновляем текущее описание категории (для совместимости с сохранением)
    setCurrentEvaluation({ category: categoryId, condition: wearToLabel(val), penalty: val });

    // Пересчитываем диапазон по всем четырём значениям
    const range = calculatePriceRange(
      basePrice,
      modelName,
      {
        front: wearToLabel(nextWear.display_front),
        back: wearToLabel(nextWear.display_back),
      },
      {
        backCamera: wearToLabel(nextWear.back_camera),
        battery: wearToBattery(nextWear.battery),
      }
    );
    setPriceRange(range);
    setPrice(range.midpoint);
    try {
      sessionStorage.setItem('priceRange', JSON.stringify(range));
      sessionStorage.setItem('price', JSON.stringify(range.midpoint));
      sessionStorage.setItem('calculatedPrice', JSON.stringify(range.midpoint));
    } catch {}
  };

  return (
    <div className="space-y-4">
      {categories.map((c) => (
        <WearSlider
          key={c.id}
          category={c.id}
          images={c.images}
          value={(wearValues as any)[c.id] as number}
          onValueChange={(val) => handleValueChange(c.id, val)}
          imageSize={imageSize}
        />
      ))}
    </div>
  );
}

export default function EvaluationPage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { 
    telegramId, 
    modelname, 
    setUserEvaluation, 
    setDamagePercent, 
    price, 
    setPrice, 
    setCurrentStep 
  } = useAppStore();
  
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wearValues, setWearValues] = useState({
    display_front: 0,
    display_back: 0,
    back_camera: 0,
    battery: 0,
  });
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    category: string;
    condition: string;
    penalty: number;
  } | null>(null);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
    midpoint: number;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  // Persisted wear state
  const WEAR_STORAGE_KEY = 'evaluationWearValues';

  // Disable vertical swipes using Telegram Apps SDK swipe behavior
  useEffect(() => {
    let destroy: (() => void) | undefined
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        init();
        const manager = swipeBehavior;
        try { manager?.mount?.(); } catch {}
        try {
          manager?.disableVertical?.();
          try { (window as any).Telegram.WebApp.expand(); } catch {}
          try { (window as any).Telegram.WebApp.enableClosingConfirmation(); } catch {}
          destroy = () => {
            try { manager?.enableVertical?.(); } catch {}
            try { manager?.unmount?.(); } catch {}
          }
        } catch {}
      }
    } catch {}
    
    // Hard UI fallback to reduce vertical gestures
    const prevTouchAction = document.body.style.touchAction
    const prevOverscrollY = (document.body.style as any).overscrollBehaviorY
    const prevHtmlOverscrollY = (document.documentElement.style as any).overscrollBehaviorY
    const prevOverflow = document.body.style.overflow
    const prevHeight = document.body.style.height
    document.body.style.touchAction = 'pan-x'
    ;(document.body.style as any).overscrollBehaviorY = 'contain'
    ;(document.documentElement.style as any).overscrollBehaviorY = 'contain'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100dvh'
    
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        // Store touch start position for gesture detection
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      // Prevent vertical swipe-to-dismiss in Telegram shell
        e.preventDefault();
    }
    
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    
    return () => {
      try { destroy?.(); } catch {}
      document.body.style.touchAction = prevTouchAction
      ;(document.body.style as any).overscrollBehaviorY = prevOverscrollY
      ;(document.documentElement.style as any).overscrollBehaviorY = prevHtmlOverscrollY
      document.body.style.overflow = prevOverflow
      document.body.style.height = prevHeight
      document.removeEventListener('touchstart', onTouchStart as any)
      document.removeEventListener('touchmove', onTouchMove as any)
    };
  }, []);

  // Ensure store knows we're on the evaluation step
  useEffect(() => {
    try { 
      setCurrentStep('evaluation'); 
      sessionStorage.setItem('currentStep', 'evaluation'); 
    } catch {}
  }, [setCurrentStep]);

  // Load base price from session storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedBase = sessionStorage.getItem("basePrice");
    if (storedBase) {
      const parsed = Number(storedBase);
      if (!Number.isNaN(parsed)) {
        setBasePrice(parsed);
      }
    }
  }, []);

  // Handle evaluation changes
  const handleEvaluationChange = useCallback((evaluation: {
    category: string;
    condition: string;
    penalty: number;
  }) => {
    setCurrentEvaluation(evaluation);
    
    // Save to session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userEvaluationId", evaluation.condition);
      sessionStorage.setItem("userEvaluation", evaluation.condition);
      sessionStorage.setItem("damagePercent", String(evaluation.penalty));
    }
  }, []);

  // Handle price changes
  const handlePriceChange = useCallback((range: {
    min: number;
    max: number;
    midpoint: number;
  }) => {
    setPriceRange(range);
    setPrice(range.midpoint);
    
    // Save to session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("price", JSON.stringify(range.midpoint));
      sessionStorage.setItem("priceRange", JSON.stringify(range));
      sessionStorage.setItem("calculatedPrice", JSON.stringify(range.midpoint));
    }
  }, [setPrice]);

  // Handle continue button (after dialog)
  const handleContinue = async () => {
    if (!currentEvaluation || !priceRange) return;

    setSubmitting(true);
    setIsNavigating(true);
    setUserEvaluation(currentEvaluation.condition);
    setDamagePercent(currentEvaluation.penalty);

    try {
      await fetch("/api/request/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          userEvaluation: currentEvaluation.condition,
          damagePercent: currentEvaluation.penalty,
          price: priceRange.midpoint,
          priceRange,
        }),
      });
    } catch (error) {
      console.error("Error saving evaluation:", error);
    } finally {
      // Не закрываем диалог вручную — держим его открытым до навигации
      setSubmitting(false);
      router.push("/request/submit");
    }
  };

  // Persist wearValues locally and in Telegram CloudStorage (if доступен)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(WEAR_STORAGE_KEY, JSON.stringify(wearValues));
    } catch {}
    try {
      const webApp: any = (window as any).Telegram?.WebApp;
      const cs = webApp?.CloudStorage;
      if (cs?.setItem) {
        cs.setItem(WEAR_STORAGE_KEY, JSON.stringify(wearValues), () => {});
      }
    } catch {}
  }, [wearValues]);

  // Restore wearValues on mount (CloudStorage → sessionStorage → defaults)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let restored = false;
    try {
      const webApp: any = (window as any).Telegram?.WebApp;
      const cs = webApp?.CloudStorage;
      if (cs?.getItem) {
        cs.getItem(WEAR_STORAGE_KEY, (error: any, value: string | null) => {
          if (!error && value) {
            try {
              const parsed = JSON.parse(value);
              setWearValues((prev) => ({ ...prev, ...parsed }));
            } catch {}
          } else {
            // Fallback to sessionStorage
            try {
              const local = sessionStorage.getItem(WEAR_STORAGE_KEY);
              if (local) {
                const parsed = JSON.parse(local);
                setWearValues((prev) => ({ ...prev, ...parsed }));
              }
            } catch {}
          }
        });
        restored = true;
      }
    } catch {}
    if (!restored) {
      try {
        const local = sessionStorage.getItem(WEAR_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          setWearValues((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
  }, []);

  // Recompute price range on wearValues restore (when user returns to the page)
  useEffect(() => {
    const anyNonZero =
      wearValues.display_front > 0 ||
      wearValues.display_back > 0 ||
      wearValues.back_camera > 0 ||
      wearValues.battery > 0;
    if (!anyNonZero) return;
    const base = basePrice ?? price ?? 50000;
    const range = calculatePriceRange(
      base,
      modelname ?? 'iPhone',
      {
        front: wearValues.display_front <= 25 ? 'Новый' : wearValues.display_front <= 50 ? 'Очень хорошее' : wearValues.display_front <= 75 ? 'Заметные царапины' : 'Трещины',
        back: wearValues.display_back <= 25 ? 'Новый' : wearValues.display_back <= 50 ? 'Очень хорошее' : wearValues.display_back <= 75 ? 'Заметные царапины' : 'Трещины',
      },
      {
        backCamera: wearValues.back_camera <= 25 ? 'Новый' : wearValues.back_camera <= 50 ? 'Очень хорошее' : wearValues.back_camera <= 75 ? 'Заметные царапины' : 'Трещины',
        battery: wearValues.battery <= 25 ? '95%' : wearValues.battery <= 50 ? '90%' : wearValues.battery <= 75 ? '85%' : '75%',
      }
    );
    setPriceRange(range);
    setPrice(range.midpoint);
    try {
      sessionStorage.setItem('priceRange', JSON.stringify(range));
      sessionStorage.setItem('price', JSON.stringify(range.midpoint));
      sessionStorage.setItem('calculatedPrice', JSON.stringify(range.midpoint));
    } catch {}
  }, [wearValues, basePrice, modelname, setPrice]);

  return (
    <Page back={goBack}>
      <div className="min-h-screen overflow-hidden">
        {/* Новый визуальный UI оценки */}
        <div className="max-w-md mx-auto p-2">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Оценка <br />состояния</h1>
          </div>

          <EvaluationSliders 
            wearValues={wearValues}
            setWearValues={setWearValues}
            setCurrentEvaluation={setCurrentEvaluation}
            setPriceRange={setPriceRange}
            setPrice={setPrice}
            basePrice={basePrice ?? price ?? 50000}
            modelName={modelname ?? 'iPhone 14'}
          />
        </div>

        {/* Диалог диапазона цен */}
        <Dialog
          open={showResultDialog || isNavigating}
          onOpenChange={(open) => {
            // Блокируем закрытие во время сабмита/навигации
            if (submitting || isNavigating) return;
            setShowResultDialog(open);
          }}
        >
          <DialogContent className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg">
            <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-4">
              Итоговая оценка
            </DialogTitle>
            {priceRange && (
              <div className="text-center space-y-4">
                {/* Диапазон цен - главный акцент */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Диапазон оценки
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {priceRange.min.toLocaleString()} — {priceRange.max.toLocaleString()} ₽
                  </div>
                </div>

                {/* Визуальная полоса диапазона */}
                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    style={{ 
                      left: '0%', 
                      width: '100%',
                      background: `linear-gradient(to right, 
                        #10b981 0%, 
                        #3b82f6 50%, 
                        #f59e0b 100%)`
                    }}
                  />
                  {/* Маркеры */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 rounded-full" />
                  <div className="absolute top-0 right-0 w-1 h-full bg-slate-900 rounded-full" />
                </div>

                {/* Дополнительная информация */}
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Базовая цена: {(basePrice ?? price ?? 50000).toLocaleString()} ₽</div>
                  <div>Разница: {((priceRange.max - priceRange.min) / priceRange.max * 100).toFixed(0)}% от максимальной</div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleContinue}
                    disabled={submitting || isNavigating}
                    className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-80"
                  >
                    {submitting || isNavigating ? 'Переходим…' : 'Продолжить'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {isNavigating && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center">
              <Image src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
              <p className="mt-4 text-lg font-semibold text-gray-700">Переходим к подтверждению…</p>
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
                <Button
                  type="button"
                  disabled={!priceRange || submitting}
              onClick={() => setShowResultDialog(true)}
              className="w-full h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
              {submitting ? 'Сохранение...' : 'Продолжить'}
                </Button>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}