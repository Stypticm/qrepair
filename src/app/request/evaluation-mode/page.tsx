'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, User, Lock } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';

export default function EvaluationModePage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { setCurrentStep } = useAppStore();
  
  const [selectedMode, setSelectedMode] = useState<'ai' | 'manual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeSelect = async (mode: 'ai' | 'manual') => {
    setSelectedMode(mode);
    
    if (mode === 'ai') {
      // ИИ-режим: блёрим кнопки, блокируем переход
      return;
    }
    
    // Ручной режим: переходим к device-info
    setIsLoading(true);
    setCurrentStep('device-info');
    
    // Небольшая задержка для плавности
    setTimeout(() => {
      router.push('/request/device-info');
    }, 300);
  };

  const handleBack = () => {
    goBack();
  };

  return (
    <Page back={handleBack}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
        {/* Заголовок */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Способ оценки
          </h1>
          <p className="text-gray-600 text-sm">
            Выберите как оценить устройство
          </p>
        </div>

        {/* Абсолютно центрированные блоки выбора */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
          <div className="space-y-3">
            {/* ИИ-оценка */}
            <div
              className="p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 border-gray-200 bg-white hover:border-gray-300 blur-[0.5px] opacity-75"
              onClick={() => handleModeSelect('ai')}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ИИ-оценка
                    </h3>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Автоматическая оценка по фото
                  </p>
                </div>
              </div>
            </div>

            {/* Ручная оценка */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedMode === 'manual' 
                  ? 'border-[#2dc2c6] bg-[#2dc2c6]/5' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleModeSelect('manual')}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-[#2dc2c6] rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ручная оценка
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Пошаговая оценка состояния
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка продолжения */}
        {selectedMode === 'manual' && (
          <div className="absolute bottom-6 left-4 right-4">
            <Button
              onClick={() => handleModeSelect('manual')}
              disabled={isLoading}
              className="w-full h-12 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Переходим...</span>
                </div>
              ) : (
                'Начать оценку'
              )}
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}
