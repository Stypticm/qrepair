'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Power, 
  Wrench, 
  Monitor, 
  User, 
  Fingerprint, 
  Camera, 
  Mic, 
  Volume2, 
  Battery, 
  Square, 
  Droplets, 
  Signal, 
  Wifi, 
  Bluetooth,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useDraftSave } from '@/hooks/useDraftSave';
import { useAppStore } from '@/stores/authStore';
import { 
  DEVICE_FUNCTIONS, 
  DeviceFunctionState, 
  calculateFunctionDiscount,
  getCriticalFunctionsStatus,
  type DeviceFunction 
} from '@/core/lib/deviceFunctions';
import { calculatePriceRange, type DeviceConditions, type AdditionalConditions } from '@/core/lib/priceCalculation';

const ICON_MAP = {
  power: Power,
  tool: Wrench,
  display: Monitor,
  face: User,
  fingerprint: Fingerprint,
  camera: Camera,
  mic: Mic,
  volume: Volume2,
  battery: Battery,
  button: Square,
  droplet: Droplets,
  signal: Signal,
  wifi: Wifi,
  bluetooth: Bluetooth
};

interface FunctionCardProps {
  func: DeviceFunction;
  state: 'working' | 'not_working' | 'unknown';
  onStateChange: (key: string, state: 'working' | 'not_working' | 'unknown') => void;
}

function FunctionCard({ func, state, onStateChange }: FunctionCardProps) {
  const IconComponent = ICON_MAP[func.icon as keyof typeof ICON_MAP] || Square;
  
  const getStateIcon = (state: string) => {
    switch (state) {
      case 'working': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'not_working': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'working': return 'border-green-200 bg-green-50';
      case 'not_working': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${getStateColor(state)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {func.title}
                {func.critical && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    Критично
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-600">{func.description}</p>
            </div>
          </div>
          {getStateIcon(state)}
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={state === 'working' ? 'default' : 'outline'}
            className={`flex-1 h-8 text-xs ${
              state === 'working' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'text-green-600 border-green-300 hover:bg-green-50'
            }`}
            onClick={() => onStateChange(func.key, 'working')}
          >
            Работает
          </Button>
          <Button
            size="sm"
            variant={state === 'not_working' ? 'default' : 'outline'}
            className={`flex-1 h-8 text-xs ${
              state === 'not_working' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'text-red-600 border-red-300 hover:bg-red-50'
            }`}
            onClick={() => onStateChange(func.key, 'not_working')}
          >
            Не работает
          </Button>
          <Button
            size="sm"
            variant={state === 'unknown' ? 'default' : 'outline'}
            className={`flex-1 h-8 text-xs ${
              state === 'unknown' 
                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onStateChange(func.key, 'unknown')}
          >
            Не знаю
          </Button>
        </div>
      </CardContent>
    </Card>
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
  
  const [functionStates, setFunctionStates] = useState<DeviceFunctionState>({});
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleStateChange = useCallback((key: string, state: 'working' | 'not_working' | 'unknown') => {
    setFunctionStates(prev => ({
      ...prev,
      [key]: state
    }));
  }, []);

  const handleContinue = useCallback(async () => {
    // Проверяем критические функции
    const criticalStatus = getCriticalFunctionsStatus(functionStates, DEVICE_FUNCTIONS);
    
    if (criticalStatus.hasCriticalIssues) {
      setShowCriticalWarning(true);
      return;
    }

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
      const priceRange = calculatePriceRange(
        basePrice,
        modelname || 'iPhone',
        deviceConditionsData,
        additionalConditionsData,
        functionDiscount
      );
      
      // Сохраняем цену
      setPrice(priceRange.midpoint);
      
      // Сохраняем состояния функций в sessionStorage
      sessionStorage.setItem('deviceFunctionStates', JSON.stringify(functionStates));
      sessionStorage.setItem('functionDiscount', functionDiscount.toString());
      
      // Переходим к следующему шагу
      setCurrentStep('photos');
      router.push('/request/photos');
      
    } catch (error) {
      console.error('Ошибка при расчёте цены:', error);
    } finally {
      setIsLoading(false);
    }
  }, [functionStates, deviceConditions, additionalConditions, modelname, setPrice, setCurrentStep, router]);

  const criticalStatus = getCriticalFunctionsStatus(functionStates, DEVICE_FUNCTIONS);
  const hasAnySelection = Object.values(functionStates).some(state => state !== 'unknown');

  return (
    <Page back={goBack}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Заголовок */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Рабочие функции
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Отметьте, какие функции работают на вашем устройстве
            </p>
          </motion.div>

          {/* Предупреждение о критических функциях */}
          <AnimatePresence>
            {showCriticalWarning && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">
                      Критические проблемы обнаружены
                    </h4>
                    <p className="text-xs text-red-700 mb-2">
                      Следующие функции не работают:
                    </p>
                    <ul className="text-xs text-red-700 list-disc list-inside">
                      {criticalStatus.criticalIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-700 mt-2">
                      Это значительно снизит стоимость устройства.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setShowCriticalWarning(false)}
                >
                  Понятно
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Список функций */}
          <div className="space-y-3 mb-6">
            {DEVICE_FUNCTIONS.map((func, index) => (
              <motion.div
                key={func.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <FunctionCard
                  func={func}
                  state={functionStates[func.key] || 'unknown'}
                  onStateChange={handleStateChange}
                />
              </motion.div>
            ))}
          </div>

          {/* Кнопка продолжения */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              onClick={handleContinue}
              disabled={!hasAnySelection || isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Рассчитываем цену...</span>
                </div>
              ) : (
                'Продолжить'
              )}
            </Button>
          </motion.div>

          {/* Информация о влиянии на цену */}
          {hasAnySelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <p className="text-xs text-blue-700">
                  Неисправные функции снижают стоимость устройства. 
                  Критические проблемы (например, не включается) влияют сильнее всего.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Page>
  );
}
