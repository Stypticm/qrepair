'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { calculatePriceRange, DeviceConditions, AdditionalConditions } from '@/core/lib/priceCalculation';

// Типы для состояний телефона
interface PhoneCondition {
  id: string;
  label: string;
  description: string;
  image: string;
  penalty: number;
  accent: 'mint' | 'sea' | 'amber' | 'rose';
}

interface EvaluationCategory {
  id: string;
  label: string;
  shortLabel: string;
  conditions: PhoneCondition[];
}

// Данные категорий оценки (адаптированные под ваши изображения)
const evaluationCategories: EvaluationCategory[] = [
  {
    id: 'display_front',
    label: 'Передняя панель',
    shortLabel: 'Экран',
    conditions: [
      {
        id: 'perfect',
        label: 'Идеальное',
        description: 'Корпус и дисплей без следов использования, полностью как из коробки.',
        image: 'display_front_new',
        penalty: 0,
        accent: 'mint',
      },
      {
        id: 'light-wear',
        label: 'Отличное',
        description: 'Минимальные следы эксплуатации: едва заметные микроцарапины.',
        image: 'display_front',
        penalty: 5,
        accent: 'mint',
      },
      {
        id: 'moderate',
        label: 'Хорошее',
        description: 'Есть лёгкие потертости или пара царапин по корпусу.',
        image: 'display_front_have_scratches',
        penalty: 15,
        accent: 'sea',
      },
      {
        id: 'heavy-wear',
        label: 'Удовлетворительное',
        description: 'Множественные царапины или сколы, но без трещин дисплея.',
        image: 'display_front_scratches',
        penalty: 25,
        accent: 'amber',
      },
    ],
  },
  {
    id: 'display_back',
    label: 'Задняя панель',
    shortLabel: 'Задняя',
    conditions: [
      {
        id: 'perfect',
        label: 'Идеальное',
        description: 'Задняя панель без следов использования.',
        image: 'display_back_new',
        penalty: 0,
        accent: 'mint',
      },
      {
        id: 'light-wear',
        label: 'Отличное',
        description: 'Минимальные следы эксплуатации на задней панели.',
        image: 'display_back',
        penalty: 3,
        accent: 'mint',
      },
      {
        id: 'moderate',
        label: 'Хорошее',
        description: 'Лёгкие потертости или пара царапин на задней панели.',
        image: 'display_back_have_scratches',
        penalty: 8,
        accent: 'sea',
      },
      {
        id: 'heavy-wear',
        label: 'Удовлетворительное',
        description: 'Заметные царапины или сколы на задней панели.',
        image: 'display_back_scratches',
        penalty: 15,
        accent: 'amber',
      },
    ],
  },
  {
    id: 'back_camera',
    label: 'Камера',
    shortLabel: 'Камера',
    conditions: [
      {
        id: 'perfect',
        label: 'Идеальное',
        description: 'Камера работает идеально, объектив чистый.',
        image: 'back_camera_new',
        penalty: 0,
        accent: 'mint',
      },
      {
        id: 'light-wear',
        label: 'Отличное',
        description: 'Камера работает отлично, минимальные следы на объективе.',
        image: 'back_camera',
        penalty: 3,
        accent: 'mint',
      },
      {
        id: 'moderate',
        label: 'Хорошее',
        description: 'Камера работает, есть заметные царапины на объективе.',
        image: 'back_camera_have_scratches',
        penalty: 8,
        accent: 'sea',
      },
      {
        id: 'heavy-wear',
        label: 'Удовлетворительное',
        description: 'Камера работает, но есть трещины или серьёзные повреждения.',
        image: 'back_camera_scratches',
        penalty: 15,
        accent: 'amber',
      },
    ],
  },
  {
    id: 'battery',
    label: 'Батарея',
    shortLabel: 'Батарея',
    conditions: [
      {
        id: 'perfect',
        label: '95%',
        description: 'Батарея работает как новая, отличная ёмкость.',
        image: 'battery_95',
        penalty: 0,
        accent: 'mint',
      },
      {
        id: 'light-wear',
        label: '90%',
        description: 'Батарея работает хорошо, небольшая потеря ёмкости.',
        image: 'battery_90',
        penalty: 2,
        accent: 'mint',
      },
      {
        id: 'moderate',
        label: '85%',
        description: 'Батарея работает нормально, заметная потеря ёмкости.',
        image: 'battery_85',
        penalty: 5,
        accent: 'sea',
      },
      {
        id: 'heavy-wear',
        label: '75%',
        description: 'Батарея работает, но требует частой зарядки.',
        image: 'battery_75',
        penalty: 10,
        accent: 'amber',
      },
    ],
  },
];

// Цветовые градиенты для акцентов
const accentGradients = {
  mint: 'from-emerald-200/60 via-teal-200/40 to-slate-50/40',
  sea: 'from-cyan-200/60 via-sky-200/40 to-slate-50/40',
  amber: 'from-amber-200/60 via-orange-200/40 to-slate-50/40',
  rose: 'from-rose-200/60 via-pink-200/40 to-slate-50/40',
};

interface PhoneEvaluationCarouselProps {
  basePrice?: number;
  modelName?: string;
  onEvaluationChange?: (evaluation: {
    category: string;
    condition: string;
    penalty: number;
  }) => void;
  onPriceChange?: (priceRange: { min: number; max: number; midpoint: number }) => void;
}

export function PhoneEvaluationCarousel({
  basePrice = 50000,
  modelName = 'iPhone 14',
  onEvaluationChange,
  onPriceChange,
}: PhoneEvaluationCarouselProps) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentCondition, setCurrentCondition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Получаем текущую категорию и состояние
  const currentCategoryData = evaluationCategories[currentCategory];
  const currentConditionData = currentCategoryData?.conditions[currentCondition];

  // Форматирование денег
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);

  // Расчёт цены на основе текущих состояний
  const priceRange = useMemo(() => {
    if (!currentConditionData) return null;

    // Конвертируем состояния в формат для расчёта цены
    const deviceConditions: DeviceConditions = {
      front: mapConditionToPriceFormat(currentConditionData.label),
    };

    const additionalConditions: AdditionalConditions = {
      backCamera: mapConditionToPriceFormat(currentConditionData.label),
      battery: mapBatteryToPriceFormat(currentConditionData.label),
    };

    return calculatePriceRange(basePrice, modelName, deviceConditions, additionalConditions);
  }, [currentConditionData, basePrice, modelName]);

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    if (currentConditionData && priceRange) {
      onEvaluationChange?.({
        category: currentCategoryData.id,
        condition: currentConditionData.id,
        penalty: currentConditionData.penalty,
      });
      onPriceChange?.(priceRange);
    }
  }, [currentConditionData, priceRange, currentCategoryData, onEvaluationChange, onPriceChange]);

  // Обработчики навигации
  const handleCategoryChange = (index: number) => {
    if (isTransitioning) return;
    setCurrentCategory(index);
    setCurrentCondition(0); // Сбрасываем состояние при смене категории
  };

  const handleConditionChange = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentCondition(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Обработка свайпов
  const handleSwipeLeft = () => {
    if (currentCondition < currentCategoryData.conditions.length - 1) {
      handleConditionChange(currentCondition + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentCondition > 0) {
      handleConditionChange(currentCondition - 1);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Селектор категорий (вместо цветов в оригинале) */}
      <div className="flex justify-center gap-3 p-4 pt-8">
        {evaluationCategories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(index)}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
              currentCategory === index
                ? 'bg-slate-900 scale-110 shadow-lg'
                : 'bg-slate-200 hover:bg-slate-300 hover:scale-105'
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            <span className="relative text-xs font-medium text-slate-700 text-center leading-tight">
              {category.shortLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Основная область с изображением */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCategory}-${currentCondition}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center p-8"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startX = touch.clientX;
              const startY = touch.clientY;
              
              const handleTouchEnd = (e: TouchEvent) => {
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                  if (deltaX > 0) {
                    handleSwipeRight();
                  } else {
                    handleSwipeLeft();
                  }
                }
                
                document.removeEventListener('touchend', handleTouchEnd);
              };
              
              document.addEventListener('touchend', handleTouchEnd);
            }}
          >
            <div className="relative w-full max-w-sm h-96">
              <Image
                src={getPictureUrl(`${currentConditionData?.image}.png`) || '/display_front_new.png'}
                alt={currentConditionData?.label || 'Состояние телефона'}
                fill
                className="object-contain"
                priority
              />
              
              {/* Overlay с эффектом износа */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${accentGradients[currentConditionData?.accent || 'mint']} opacity-30`}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Индикаторы состояний */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {currentCategoryData.conditions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleConditionChange(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentCondition
                  ? 'bg-slate-900 scale-125'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Описание состояния */}
      <div className="p-6 text-center bg-white/80 backdrop-blur-sm">
        <motion.div
          key={`desc-${currentCategory}-${currentCondition}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {currentConditionData?.label}
          </h3>
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            {currentConditionData?.description}
          </p>
          
          {/* Информация о цене */}
          {priceRange && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Диапазон цен</p>
              <p className="text-lg font-bold text-slate-900">
                {formatMoney(priceRange.min)} — {formatMoney(priceRange.max)}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Средняя: {formatMoney(priceRange.midpoint)}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Вспомогательные функции для маппинга состояний
function mapConditionToPriceFormat(label: string): string {
  if (/идеал|новый/i.test(label)) return 'Новый';
  if (/отлич/i.test(label)) return 'Очень хорошее';
  if (/хорош/i.test(label)) return 'Заметные царапины';
  if (/удовлетворительн/i.test(label)) return 'Трещины';
  return 'Очень хорошее';
}

function mapBatteryToPriceFormat(label: string): string {
  if (/95/i.test(label)) return '95%';
  if (/90/i.test(label)) return '90%';
  if (/85/i.test(label)) return '85%';
  if (/75/i.test(label)) return '75%';
  return '95%';
}
