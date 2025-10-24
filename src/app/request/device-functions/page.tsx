'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Power, 
  Wrench, 
  Monitor, 
  User, 
  Fingerprint, 
  Camera,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useFormData } from '@/hooks/usePersistentState';
import { useAppStore } from '@/stores/authStore';
import { 
  DEVICE_FUNCTIONS, 
  DeviceFunctionState, 
  calculateFunctionDiscount,
  type DeviceFunction 
} from '@/core/lib/deviceFunctions';
import { calculatePriceRange, type DeviceConditions, type AdditionalConditions } from '@/core/lib/priceCalculation';
import { usePageState } from '@/hooks/usePageState';
import { DeviceFunctionsContinueButton } from '@/components/ContinueButton';
import { PriceRangeDialog } from '@/components/UniversalDialog';

const ICON_MAP = {
  power: Power,
  tool: Wrench,
  display: Monitor,
  face: User,
  fingerprint: Fingerprint,
  camera: Camera
};

interface FunctionCardProps {
  func: DeviceFunction;
  state: 'working' | 'not_working' | 'unknown';
  onStateChange: (key: string, state: 'working' | 'not_working' | 'unknown') => void;
}

function FunctionCard({ func, state, onStateChange }: FunctionCardProps) {
  const IconComponent = ICON_MAP[func.icon as keyof typeof ICON_MAP] || Power;
  
  const getStateIcon = (state: string) => {
    switch (state) {
      case 'working': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'not_working': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Определяем, какие функции должны показывать "Да/Нет/Не знаю"
  const isYesNoQuestion = func.key === 'device_power' || func.key === 'repair_history';
  
  const getButtonText = (buttonState: string) => {
    if (isYesNoQuestion) {
      switch (buttonState) {
        case 'working': return 'Да';
        case 'not_working': return 'Нет';
        default: return 'Не знаю';
      }
    } else {
      switch (buttonState) {
        case 'working': return 'Работает';
        case 'not_working': return 'Не работает';
        default: return 'Не знаю';
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {func.title}
            </h3>
          </div>
        </div>
        {getStateIcon(state)}
      </div>
      
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant={state === 'working' ? 'default' : 'outline'}
          className={`flex-1 h-7 text-xs ${
            state === 'working' 
              ? 'bg-gray-800 hover:bg-gray-900 text-white' 
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onStateChange(func.key, 'working')}
        >
          {getButtonText('working')}
        </Button>
        <Button
          size="sm"
          variant={state === 'not_working' ? 'default' : 'outline'}
          className={`flex-1 h-7 text-xs ${
            state === 'not_working' 
              ? 'bg-gray-800 hover:bg-gray-900 text-white' 
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onStateChange(func.key, 'not_working')}
        >
          {getButtonText('not_working')}
        </Button>
        <Button
          size="sm"
          variant={state === 'unknown' ? 'default' : 'outline'}
          className={`flex-1 h-7 text-xs ${
            state === 'unknown' 
              ? 'bg-gray-800 hover:bg-gray-900 text-white' 
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onStateChange(func.key, 'unknown')}
        >
          {getButtonText('unknown')}
        </Button>
      </div>
    </div>
  );
}

export default function DeviceFunctionsPage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { 
    setCurrentStep, 
    setPrice, 
    modelname,
    deviceConditions,
    additionalConditions 
  } = useAppStore();
  
  const { saveToDatabase } = useFormData();
  
  // Используем новую систему управления состоянием
  const {
    state: pageState,
    setState: setPageState,
    navigationState,
    setNavigationState,
    handleContinue,
    handleDialogContinue
  } = usePageState({
    step: 'device-functions',
    storageKey: 'deviceFunctionStates',
    hasDialog: true,
    restoreOnMount: true
  }, {
    functionStates: {} as DeviceFunctionState,
    priceRange: undefined as {min: number, max: number, midpoint: number} | undefined
  });

  const { functionStates, priceRange } = pageState;
  const { isLoading, isNavigating, isDialogOpen, isDialogLocked } = navigationState;


  // Инициализация состояний функций
  useEffect(() => {
    if (Object.keys(functionStates).length === 0) {
      const initialStates: DeviceFunctionState = {};
      DEVICE_FUNCTIONS.forEach(func => {
        initialStates[func.key] = 'unknown';
      });
      setPageState({ functionStates: initialStates });
    }
    setCurrentStep('device-functions');
  }, [setCurrentStep, functionStates, setPageState]);

  // Получаем данные оценки при загрузке страницы
  useEffect(() => {
    const loadEvaluationData = async () => {
      try {
        const response = await fetch('/api/request/getDraft');
        if (response.ok) {
          const data = await response.json();
          if (data.priceRange) {
            setPageState({ priceRange: data.priceRange });
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных оценки:', error);
      }
    };
    
    loadEvaluationData();
  }, [setPageState]);

  const handleStateChange = useCallback((key: string, state: 'working' | 'not_working' | 'unknown') => {
    setPageState({
      functionStates: {
        ...functionStates,
        [key]: state
      }
    });
  }, [functionStates, setPageState]);

  // Автоматическое сохранение при изменении состояний функций
  useEffect(() => {
    if (Object.values(functionStates).some(state => state !== 'unknown')) {
      const timeoutId = setTimeout(() => {
        saveToDatabase();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [functionStates, saveToDatabase]);

  const handleShowDialog = useCallback(async () => {
    console.log('🔍 handleShowDialog вызвана');
    console.log('📱 functionStates:', functionStates);
    console.log('💰 savedBasePrice:', sessionStorage.getItem('basePrice'));
    
    setNavigationState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Рассчитываем скидку от функций
      const functionDiscount = calculateFunctionDiscount(functionStates, DEVICE_FUNCTIONS);
      
      // Получаем базовую цену
      const savedBasePrice = sessionStorage.getItem('basePrice');
      if (!savedBasePrice) {
        console.error('Не найдена базовая цена');
        setNavigationState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const basePrice = parseFloat(savedBasePrice);
      
      // Получаем существующие условия
      const deviceConditionsData: DeviceConditions = {
        front: deviceConditions?.front || undefined,
        back: deviceConditions?.back || undefined,
        side: deviceConditions?.side || undefined,
      };
      const additionalConditionsData: AdditionalConditions = {
        faceId: additionalConditions?.faceId || undefined,
        touchId: additionalConditions?.touchId || undefined,
        backCamera: additionalConditions?.backCamera || undefined,
        battery: additionalConditions?.battery || undefined,
      };
      
      // Рассчитываем новый диапазон цен с учётом функций
      const calculatedPriceRange = calculatePriceRange(
        basePrice,
        modelname || 'iPhone',
        deviceConditionsData,
        additionalConditionsData,
        functionDiscount
      );
      
      // Сохраняем рассчитанный диапазон цен
      setPageState({ priceRange: calculatedPriceRange });
      
      // Сохраняем диапазон цен в sessionStorage для передачи на другие страницы
      sessionStorage.setItem('priceRange', JSON.stringify(calculatedPriceRange));
      
      // Открываем диалог
      setNavigationState(prev => ({ ...prev, isDialogOpen: true }));
      
      console.log('✅ Диалог открыт успешно');
      
    } catch (error) {
      console.error('Ошибка при расчёте цены:', error);
    } finally {
      setNavigationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [functionStates, deviceConditions, additionalConditions, modelname, setPageState, setNavigationState]);

  const handleDialogContinueAction = useCallback(async () => {
    await handleDialogContinue('/request/delivery-options', 'delivery-options', {
      functionStates,
      priceRange,
      functionDiscount: calculateFunctionDiscount(functionStates, DEVICE_FUNCTIONS)
    });
  }, [functionStates, priceRange, handleDialogContinue]);

  const hasAnySelection = Object.values(functionStates).some(state => state !== 'unknown');
  
  // Логика блокировки: если телефон не включается, показываем только первые две функции
  const devicePowerState = functionStates['device_power'];
  const shouldShowAllFunctions = devicePowerState === 'working' || devicePowerState === 'unknown';
  
  const visibleFunctions = shouldShowAllFunctions 
    ? DEVICE_FUNCTIONS 
    : DEVICE_FUNCTIONS.slice(0, 2); // Показываем только "Включается ли телефон" и "Был ли ремонт"

  return (
    <Page back={goBack}>
      <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
        <div className="flex-1 p-3 pt-2 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-4 items-center text-center">
            {/* Заголовок */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
            </motion.div>

            {/* Список функций */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full space-y-2"
            >
              {visibleFunctions.map((func, index) => (
                <motion.div
                  key={func.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <FunctionCard
                    func={func}
                    state={functionStates[func.key] || 'unknown'}
                    onStateChange={handleStateChange}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Информационное сообщение, когда телефон не включается */}
            {!shouldShowAllFunctions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="w-full bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 text-sm">
                      Дополнительная проверка недоступна
                    </h3>
                    <p className="text-yellow-700 text-xs mt-1">
                      Поскольку устройство не включается, остальные функции проверить невозможно
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Кнопка продолжения */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <DeviceFunctionsContinueButton
          onClick={handleShowDialog}
          disabled={!hasAnySelection}
          isLoading={isLoading}
        >
          Продолжить
        </DeviceFunctionsContinueButton>
      </div>

      {/* Диалог результата оценки */}
      <PriceRangeDialog
        open={isDialogOpen}
        onOpenChange={(open) => setNavigationState(prev => ({ ...prev, isDialogOpen: open }))}
        onContinue={handleDialogContinueAction}
        isLoading={isLoading}
        isNavigating={isNavigating}
        priceRange={priceRange}
      />
    </Page>
  );
}
