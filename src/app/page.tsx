'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { Link } from '@/components/Link/Link';
import tonSvg from './_assets/ton.svg';
import picture from './_assets/picture.png';
import { Button } from '@/components/ui/button';

import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { ExpandButton } from '@/components/ExpandButton';
import { tailwindColors } from '@/core/colors';
import { ChatContext } from '@/components/ChatContext';
import { useSafeArea } from '@/hooks/useSafeArea';

export default function Home() {
  const { telegramId, setModel, setPrice, setImei, setSerialNumber, setDeviceConditions, setAdditionalConditions, resetAllStates, loadSavedData, modelname, deviceConditions, additionalConditions, imei, serialNumber } = useStartForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
  const router = useRouter();
  
  // Условно вызываем useSafeArea только если мы в Telegram
  const safeAreaHook = useSafeArea();
  const { forceFullscreen, isFullscreen } = safeAreaHook;

  useEffect(() => {
    // Принудительно вызываем fullscreen при загрузке страницы только если мы в Telegram
    if (!isFullscreen && window.Telegram?.WebApp && isInTelegram) {
      console.log('Page loaded, forcing fullscreen at', new Date().toISOString());
      forceFullscreen();
    }

    if (!telegramId) return;

    if (telegramId === '1' || telegramId === '296925626' || telegramId === '531360988') {
      setIsAdmin(true);
    }
  }, [telegramId, isFullscreen, forceFullscreen, isInTelegram]);

  // Проверяем сохраненные данные и перенаправляем на нужный шаг
  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram
    const checkTelegram = () => {
      if (typeof window !== 'undefined') {
        // Проверяем Telegram WebApp
        const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
        
        // Если есть Telegram.WebApp, то это WebApp
        const inTelegram = hasTelegramWebApp;
        
        setIsInTelegram(inTelegram);
        setIsLoading(false);
      }
    };

    // Увеличиваем задержку для более надежной проверки
    const timer = setTimeout(checkTelegram, 500);
    return () => clearTimeout(timer);
  }, []);



  // Функция для начала формы с проверкой существующей заявки
  const handleStartForm = async () => {
    try {
      // Показываем загрузку
      setIsLoading(true);

      // 1. Один запрос для получения всех данных из БД
      let draftData = null;
      if (telegramId) {
        const response = await fetch('/api/request/getDraft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegramId }),
        });

        if (response.ok) {
          draftData = await response.json();

          // Загружаем данные в контекст
          if (draftData) {
            if (draftData.modelname) setModel(draftData.modelname);
            if (draftData.price) setPrice(draftData.price);
            if (draftData.imei) setImei(draftData.imei);
            if (draftData.sn) setSerialNumber(draftData.sn);
            if (draftData.deviceConditions) setDeviceConditions(draftData.deviceConditions);
            if (draftData.additionalConditions) setAdditionalConditions(draftData.additionalConditions);
          }
        }
      }

      // 2. Проверяем, есть ли уже отправленная заявка
      if (draftData && draftData.status === 'submitted') {
        // Есть уже отправленная заявка
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          const confirmed = await new Promise((resolve) => {
            webApp.showConfirm(
              'У вас уже есть отправленная заявка. Хотите создать новую?',
              (result: boolean) => resolve(result)
            );
          });

          if (!confirmed) {
            setIsLoading(false);
            return; // Пользователь отменил
          }
        }
      }

      // 3. Получаем currentStep из уже загруженных данных
      const currentStep = draftData?.currentStep;

      // 4. Используем currentStep из БД для перенаправления
      if (currentStep) {
        switch (currentStep) {
          case 'device-info':
            router.push('/request/device-info');
            return;
          case 'form':
            router.push('/request/form');
            return;
          case 'condition':
            router.push('/request/condition');
            return;
          case 'additional-condition':
            router.push('/request/additional-condition');
            return;
          case 'submit':
            router.push('/request/submit');
            return;
          default:
            break;
        }
      }

      // 5. Fallback: определяем шаг на основе сохраненных данных
      
      // Если нет currentStep, определяем по заполненным данным
      if (imei && serialNumber && modelname && deviceConditions && additionalConditions) {
        // Все данные заполнены - перенаправляем на submit
        router.push('/request/submit');
        return;
      } else if (imei && serialNumber && modelname && deviceConditions) {
        // Данные до additional-condition заполнены - перенаправляем на additional-condition
        router.push('/request/additional-condition');
        return;
      } else if (imei && serialNumber && modelname) {
        // Данные до condition заполнены - перенаправляем на condition
        router.push('/request/condition');
        return;
      } else if (imei && serialNumber) {
        // Данные до form заполнены - перенаправляем на form
        router.push('/request/form');
        return;
      } else {
        // Начинаем с device-info
        router.push('/request/device-info');
        return;
      }

      // 6. Нет сохраненных данных - начинаем с device-info (новая заявка)
      router.push('/request/device-info');
    } catch (error) {
      console.error('Ошибка проверки заявки:', error);
      setIsLoading(false);
      // В случае ошибки просто переходим к device-info
      router.push('/request/device-info');
    }
  };



  // Показываем загрузку пока проверяем сохраненные данные
  if (isLoading || isInTelegram === null) {
    return (
      <AdaptiveContainer>
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          {/* Гиф с танцующим кокосом */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
          >
            <Image
              src={getPictureUrl('coconut-dancing.gif') || '/coconut-dancing.gif'}
              alt="Танцующий кокос"
              width={96}
              height={96}
              className="object-contain rounded-2xl"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.6,
              ease: "easeOut"
            }}
            className="text-gray-600 mt-4"
          >
            Проверяем сохраненные данные...
          </motion.p>
        </div>
      </AdaptiveContainer>
    );
  }

  // Если пользователь НЕ в Telegram, показываем страницу-редирект
  if (isInTelegram === false) {
    router.push('/telegram');
    return null;
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


              <Button
                variant="outline"
                className="w-full h-16 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleStartForm}
              >
                Оценить смартфон
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


    </AdaptiveContainer>
  );
}