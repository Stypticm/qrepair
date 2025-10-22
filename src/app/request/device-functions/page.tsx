'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { useDraftSave } from '@/hooks/useDraftSave';
import { useFormData } from '@/hooks/usePersistentState';
import { useAppStore } from '@/stores/authStore';
import { 
  DEVICE_FUNCTIONS, 
  DeviceFunctionState, 
  calculateFunctionDiscount,
  type DeviceFunction 
} from '@/core/lib/deviceFunctions';
import { calculatePriceRange, type DeviceConditions, type AdditionalConditions } from '@/core/lib/priceCalculation';

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
  
  const [functionStates, setFunctionStates] = useState<DeviceFunctionState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [priceRange, setPriceRange] = useState<{min: number, max: number, midpoint: number} | null>(null);

  // Автоматическое сохранение черновика
  useDraftSave({
    step: 'device-functions',
    data: {
      deviceFunctionStates: functionStates,
      functionDiscount: calculateFunctionDiscount(functionStates, DEVICE_FUNCTIONS)
    }
  });

  // Инициализация состояний функций
  useEffect(() => {
    const initialStates: DeviceFunctionState = {};
    DEVICE_FUNCTIONS.forEach(func => {
      initialStates[func.key] = 'unknown';
    });
    setFunctionStates(initialStates);
    setCurrentStep('device-functions');
  }, [setCurrentStep]);

  // Получаем данные оценки при загрузке страницы
  useEffect(() => {
    const loadEvaluationData = async () => {
      try {
        const response = await fetch('/api/request/getDraft');
        if (response.ok) {
          const data = await response.json();
          if (data.priceRange) {
            setPriceRange(data.priceRange);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных оценки:', error);
      }
    };
    
    loadEvaluationData();
  }, []);

  const handleStateChange = useCallback((key: string, state: 'working' | 'not_working' | 'unknown') => {
    setFunctionStates(prev => ({
      ...prev,
      [key]: state
    }));
  }, []);

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
    setIsLoading(true);
    
    try {
      // Рассчитываем скидку от функций
      const functionDiscount = calculateFunctionDiscount(functionStates, DEVICE_FUNCTIONS);
      
      // Получаем базовую цену
      const savedBasePrice = sessionStorage.getItem('basePrice');
      if (!savedBasePrice) {
        console.error('Не найдена базовая цена');
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
      setPriceRange(calculatedPriceRange);
      
      // Сохраняем диапазон цен в sessionStorage для передачи на другие страницы
      sessionStorage.setItem('priceRange', JSON.stringify(calculatedPriceRange));
      
      // Открываем диалог
      setShowResultDialog(true);
      
    } catch (error) {
      console.error('Ошибка при расчёте цены:', error);
    } finally {
      setIsLoading(false);
    }
  }, [functionStates, deviceConditions, additionalConditions, modelname]);

  const handleContinue = useCallback(async () => {
    try {
      // Сохраняем цену
      if (priceRange) {
        setPrice(priceRange.midpoint);
      }
      
      // Сохраняем состояния функций в sessionStorage
      const functionDiscount = calculateFunctionDiscount(functionStates, DEVICE_FUNCTIONS);
      sessionStorage.setItem('deviceFunctionStates', JSON.stringify(functionStates));
      sessionStorage.setItem('functionDiscount', functionDiscount.toString());
      
      // Сохраняем диапазон цен в sessionStorage (если еще не сохранен)
      if (priceRange && !sessionStorage.getItem('priceRange')) {
        sessionStorage.setItem('priceRange', JSON.stringify(priceRange));
      }
      
      // Сохраняем данные в базу данных
      await saveToDatabase();
      
      // Переходим к следующему шагу
      setCurrentStep('delivery-options');
      router.push('/request/delivery-options');
      
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  }, [functionStates, priceRange, setPrice, setCurrentStep, router, saveToDatabase]);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleShowDialog}
            disabled={!hasAnySelection || isLoading}
            className="w-full h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? 'Рассчитываем цену...' : 'Продолжить'}
          </Button>
        </motion.div>
      </div>

      {/* Диалог результата оценки */}
      <Dialog
        open={showResultDialog}
        onOpenChange={(open) => {
          if (isLoading) return;
          setShowResultDialog(open);
        }}
      >
        <DialogContent className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-4">
            Итоговая оценка
          </DialogTitle>
          {priceRange ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Диапазон оценки
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {priceRange.min.toLocaleString()} — {priceRange.max.toLocaleString()} ₽
                </div>
              </div>

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
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 rounded-full" />
                <div className="absolute top-0 right-0 w-1 h-full bg-slate-900 rounded-full" />
              </div>
              
              <div className="text-sm text-slate-600">
                Средняя цена: <span className="font-semibold text-slate-900">{priceRange.midpoint.toLocaleString()} ₽</span>
              </div>

              <div className="pt-2">
                <Button
                  onClick={async () => {
                    setShowResultDialog(false);
                    await handleContinue();
                  }}
                  disabled={isLoading}
                  className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-80"
                >
                  {isLoading ? 'Переходим…' : 'Продолжить'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-slate-900">
                Рассчитываем цену...
              </div>
              <div className="text-sm text-slate-600">
                Пожалуйста, подождите
              </div>
              <div className="pt-2">
                <Button
                  onClick={async () => {
                    setShowResultDialog(false);
                    await handleContinue();
                  }}
                  disabled={isLoading}
                  className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-80"
                >
                  {isLoading ? 'Переходим…' : 'Продолжить'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
