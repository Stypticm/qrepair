'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { Link } from '@/components/Link/Link';
import tonSvg from './_assets/ton.svg';
import picture from './_assets/picture.png';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { ExpandButton } from '@/components/ExpandButton';
import { tailwindColors } from '@/core/colors';
import { ChatContext } from '@/components/ChatContext';
import { useSafeArea } from '@/hooks/useSafeArea';

export default function Home() {
  const { telegramId, setModel, resetAllStates, loadSavedData, modelname, deviceConditions, additionalConditions, imei, serialNumber } = useStartForm();
  const { forceFullscreen, isFullscreen } = useSafeArea();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Принудительно вызываем fullscreen при загрузке страницы
    if (!isFullscreen && window.Telegram?.WebApp) {
      console.log('Page loaded, forcing fullscreen at', new Date().toISOString());
      forceFullscreen();
    }

    if (!telegramId) return;

    if (telegramId === '1' || telegramId === '296925626' || telegramId === '531360988') {
      setIsAdmin(true);
    }
  }, [telegramId, isFullscreen, forceFullscreen]);

  // Проверяем сохраненные данные и перенаправляем на нужный шаг
  useEffect(() => {
    const checkSavedData = async () => {
      if (!telegramId) {
        setIsLoading(false);
        return;
      }

      try {
        // Загружаем данные из БД
        await loadSavedData(telegramId);
        
        // Получаем currentStep из БД
        let currentStep = null;
        try {
          const response = await fetch('/api/request/getDraft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ telegramId }),
          });
          
          if (response.ok) {
            const draftData = await response.json();
            currentStep = draftData?.currentStep;
          }
        } catch (error) {
          console.error('Ошибка получения currentStep:', error);
        }
        
        if (currentStep) {
          // Используем currentStep из БД для перенаправления
          switch (currentStep) {
            case 'form':
              router.push('/request/condition');
              return;
            case 'condition':
              router.push('/request/additional-condition');
              return;
            case 'additional-condition':
              router.push('/request/device-info');
              return;
            case 'device-info':
              if (imei && serialNumber) {
                router.push('/request/submit');
              } else {
                router.push('/request/device-info');
              }
              return;
            default:
              break;
          }
        }
        
        // Fallback: определяем шаг на основе сохраненных данных
        if (imei && serialNumber) {
          // Все данные заполнены - перенаправляем на submit
          router.push('/request/submit');
          return;
        } else if (imei) {
          // IMEI заполнен, но нет S/N - перенаправляем на device-info
          router.push('/request/device-info');
          return;
        } else if (additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery)) {
          // Дополнительные условия заполнены - перенаправляем на device-info
          router.push('/request/device-info');
          return;
        } else if (deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side)) {
          // Состояния устройства заполнены - перенаправляем на additional-condition
          router.push('/request/additional-condition');
          return;
        } else if (modelname && modelname !== 'Apple iPhone 11') {
          // Модель выбрана - перенаправляем на condition
          router.push('/request/condition');
          return;
        }
        
        // Проверяем, есть ли сохраненные данные
        const hasData = !!(modelname && modelname !== 'Apple iPhone 11') || 
                       !!(deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side)) ||
                       !!(additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery)) ||
                       !!imei || !!serialNumber;
        
        setHasSavedData(hasData);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка проверки сохраненных данных:', error);
        setIsLoading(false);
      }
    };

    checkSavedData();
  }, [telegramId, loadSavedData, modelname, deviceConditions, additionalConditions, imei, serialNumber, router]);

  // Функция для сброса всех данных и начала заново
  const handleStartNew = async () => {
    try {
      // Сбрасываем все состояния
      resetAllStates();
      
      // Сбрасываем локальное состояние
      setHasSavedData(false);
      
      // Показываем уведомление
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('✅ Данные сброшены. Можете начать новую заявку.');
      }
      
      // Перенаправляем на форму
      router.push('/request/form');
    } catch (error) {
      console.error('Ошибка сброса данных:', error);
    }
  };

  // Функция для показа прогресса
  const handleShowProgress = () => {
    setShowProgress(true);
  };

  // Показываем загрузку пока проверяем сохраненные данные
  if (isLoading) {
    return (
      <AdaptiveContainer>
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Проверяем сохраненные данные...</p>
        </div>
      </AdaptiveContainer>
    );
  }

  return (
    <AdaptiveContainer>
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50 pt-20">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          <div className="space-y-6">
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 70, 
                damping: 12,
                duration: 2.2
              }}
              className="w-full"
            >
              <Image
                src={getPictureUrl(`logo4.png`) || '/logo4.png'}
                alt="Логотип"
                width={300}
                height={150}
                className="w-full h-auto object-contain mx-auto rounded-2xl shadow-lg"
              />
            </motion.div>

            <div className="flex flex-col gap-4 w-full">
              {hasSavedData && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700 text-center mb-3 font-medium">
                    У вас есть незавершенная заявка
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={handleShowProgress}
                    >
                      Прогресс
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={handleStartNew}
                    >
                      Заново
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full h-16 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/request/form')}
              >
                {hasSavedData ? 'Продолжить оценку' : 'Оценить смартфон'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium text-base rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/my-devices')}
              >
                Мои устройства
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium text-base rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/learn-more')}
              >
                Как это работает
              </Button>
            </div>
          </div>

          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2 flex flex-col gap-2">
            {/* Кнопка для принудительного расширения */}
            <ExpandButton className="w-full" />

            {isAdmin && (
              <Link href="/admin">
                <div className="w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer mx-auto overflow-hidden bg-white border border-gray-200 hover:border-gray-300">
                  <Image
                    src={getPictureUrl('admin_btn.png') || '/admin_btn.png'}
                    alt="Админ панель"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Диалоговое окно с прогрессом */}
      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="bg-white w-[90vw] max-w-sm mx-auto rounded-2xl shadow-2xl border-0 max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-4">
            Прогресс заявки
          </DialogTitle>

          <div className="space-y-4">
            {/* Шаги */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  modelname && modelname !== 'Apple iPhone 11' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {modelname && modelname !== 'Apple iPhone 11' ? '✓' : '1'}
                </div>
                <span className={`text-sm ${modelname && modelname !== 'Apple iPhone 11' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Модель устройства
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side) ? '✓' : '2'}
                </div>
                <span className={`text-sm ${deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Состояние устройства
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery) ? '✓' : '3'}
                </div>
                <span className={`text-sm ${additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Дополнительные функции
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  imei && serialNumber ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {imei && serialNumber ? '✓' : '4'}
                </div>
                <span className={`text-sm ${imei && serialNumber ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  IMEI и S/N
                </span>
              </div>
            </div>

            {/* Кнопки */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={() => setShowProgress(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-200"
              >
                Понятно
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdaptiveContainer>
  );
}