'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, DollarSign, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvaluationNavStore, getAvailableDirections } from '@/stores/evaluationNavStore';
import { useAppStore } from '@/stores/authStore';
import { Page } from '@/components/Page';
import { SwipeIndicator } from '@/components/SwipeIndicator';

/**
 * Evaluation Mode Page - Свайповый интерфейс выбора режима
 * 
 * Архитектура:
 * - Координатная сетка: (x, y)
 * - Плавная анимация через Framer Motion
 * - Touch events для мобильных
 * - Keyboard events для desktop
 * - Persistent state через Zustand
 */

// Конфигурация секций
const SECTIONS = {
  'ai-evaluation': {
    title: 'ИИ Оценка',
    subtitle: 'Автоматическая оценка по фото',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    position: { x: 0, y: 0 },
  },
  'ai-buyout': {
    title: 'ИИ Скупка',
    subtitle: 'Быстрая скупка устройства',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    position: { x: 0, y: -1 },
  },
  'repair': {
    title: 'Ремонт',
    subtitle: 'Пошаговая оценка для ремонта',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    position: { x: 0, y: 1 },
  },
} as const;

export default function EvaluationModePage() {
  const router = useRouter();
  const { setCurrentStep, telegramId, username } = useAppStore();
  const { position, goUp, goDown, goLeft, goRight, resetPosition } = useEvaluationNavStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingText, setLoadingText] = useState<string>('');
  
  // Touch handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  
  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Получаем доступные направления
  const availableDirections = getAvailableDirections(position);
  
  // Определяем текущую секцию
  const currentSection = Object.entries(SECTIONS).find(
    ([_, config]) => config.position.x === position.x && config.position.y === position.y
  )?.[0] || 'ai-evaluation';
  
  const sectionConfig = SECTIONS[currentSection as keyof typeof SECTIONS];

  // Инициализация заявки
  useEffect(() => {
    const createInitialRequest = async () => {
      if (!telegramId) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await fetch('/api/request/saveDraft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId,
            username: username || telegramId,
            currentStep: 'evaluation-mode',
          }),
        });

        if (response.ok) {
          console.log('✅ Initial request created for evaluation-mode');
        }
      } catch (error) {
        console.error('❌ Error creating initial request:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    createInitialRequest();
  }, [telegramId, username]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (availableDirections.up) goUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (availableDirections.down) goDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (availableDirections.left) router.back();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (availableDirections.right) goRight();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [availableDirections, goUp, goDown, router]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;

    const isSwiped = Math.abs(distanceX) > minSwipeDistance || Math.abs(distanceY) > minSwipeDistance;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);
    const isPositive = isHorizontal ? distanceX > 0 : distanceY > 0;

    if (isSwiped) {
      if (isHorizontal) {
        // Горизонтальный свайп влево → назад
        if (!isPositive && availableDirections.left) {
          router.back();
        }
      } else {
        // Вертикальный свайп
        if (isPositive && availableDirections.up) {
          goUp();
        } else if (!isPositive && availableDirections.down) {
          goDown();
        }
      }
    }

    // Reset
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // Обработка перехода назад
  const handleBack = () => {
    // Если в центре, делаем навигацию назад
    if (position.x === 0 && position.y === 0) {
      router.back();
      return;
    }
    
    // Из других позиций возвращаемся в центр
    resetPosition();
  };

  // Обработка кнопки "Далее"
  const handleContinue = async () => {
    setIsLoading(true);
    
    // Устанавливаем текст загрузки в зависимости от секции
    if (currentSection === 'ai-evaluation') {
      setLoadingText('Производится оценка...');
    } else if (currentSection === 'ai-buyout') {
      setLoadingText('Производится скупка...');
    } else if (currentSection === 'repair') {
      setLoadingText('Выбирается степень поломки...');
    }
    
    setCurrentStep('delivery-options');
    
    // Задержка для плавности (2 секунды как в Apple стиле)
    setTimeout(() => {
      router.push('/request/delivery-options');
    }, 2000);
  };

  // Loading state
  if (isInitializing) {
    return (
      <Page back={false}>
        <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Инициализация...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back={handleBack}>
      <div 
        className="fixed inset-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Основной контейнер с анимацией */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{
            x: position.x * 100 + '%',
            y: position.y * 100 + '%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Секция: ИИ Оценка (Центр) */}
          <motion.div
            key="ai-evaluation"
            className={`absolute inset-0 flex flex-col items-center justify-center ${SECTIONS['ai-evaluation'].bgColor}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center px-4">
              <motion.div
                className={`w-20 h-20 ${SECTIONS['ai-evaluation'].bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Bot className={`w-10 h-10 ${SECTIONS['ai-evaluation'].iconColor}`} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {SECTIONS['ai-evaluation'].title}
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                {SECTIONS['ai-evaluation'].subtitle}
              </p>
              
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl shadow-lg"
              >
                {isLoading ? 'Переходим...' : 'Начать оценку'}
              </Button>
            </div>
          </motion.div>

          {/* Секция: ИИ Скупка (Свайп вверх) */}
          <motion.div
            key="ai-buyout"
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${SECTIONS['ai-buyout'].bgColor}`}
            style={{ transform: 'translateY(-100%)' }}
          >
            <div className="text-center px-4">
              <motion.div
                className={`w-20 h-20 ${SECTIONS['ai-buyout'].bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <DollarSign className={`w-10 h-10 ${SECTIONS['ai-buyout'].iconColor}`} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {SECTIONS['ai-buyout'].title}
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                {SECTIONS['ai-buyout'].subtitle}
              </p>
              
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white text-lg rounded-xl shadow-lg"
              >
                {isLoading ? 'Переходим...' : 'Начать скупку'}
              </Button>
            </div>
          </motion.div>

          {/* Секция: Ремонт (Свайп вниз) */}
          <motion.div
            key="repair"
            className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${SECTIONS['repair'].bgColor}`}
            style={{ transform: 'translateY(100%)' }}
          >
            <div className="text-center px-4">
              <motion.div
                className={`w-20 h-20 ${SECTIONS['repair'].bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Wrench className={`w-10 h-10 ${SECTIONS['repair'].iconColor}`} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {SECTIONS['repair'].title}
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                {SECTIONS['repair'].subtitle}
              </p>
              
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="h-14 px-8 bg-yellow-600 hover:bg-yellow-700 text-white text-lg rounded-xl shadow-lg"
              >
                {isLoading ? 'Переходим...' : 'Начать ремонт'}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Подсказки навигации (стрелки) */}
        <AnimatePresence>
          {position.x === 0 && position.y === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-4"
            >
              {/* Влево (Назад) */}
              <motion.div
                animate={{ x: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <ArrowLeft className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Назад</span>
              </motion.div>

              {/* Вверх (Скупка) */}
              <motion.div
                animate={{ y: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <ArrowUp className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Скупка</span>
              </motion.div>

              {/* Вниз (Ремонт) */}
              <motion.div
                animate={{ y: [5, 0, 5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <ArrowDown className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Ремонт</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Подсказка для секции Скупка */}
        <AnimatePresence>
          {position.x === 0 && position.y === -1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-0 right-0 flex justify-center"
            >
              <motion.div
                animate={{ y: [5, 0, 5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <ArrowDown className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Вернуться</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Подсказка для секции Ремонт */}
        <AnimatePresence>
          {position.x === 0 && position.y === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-0 right-0 flex justify-center"
            >
              <motion.div
                animate={{ y: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <ArrowUp className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Вернуться</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
