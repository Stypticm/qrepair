'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { Link } from '@/components/Link/Link';
import { Button } from '@/components/ui/button';

import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { ExpandButton } from '@/components/ExpandButton';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore, isMaster } from '@/stores/authStore';

function HomeContent() {
  const { 
    setRole, 
    userId, 
    role,
    setModel, 
    setPrice, 
    setImei, 
    setSerialNumber, 
    setDeviceConditions, 
    setAdditionalConditions, 
    resetAllStates, 
    setTelegramId,
    telegramId,
    modelname,
    imei,
    serialNumber,
    deviceConditions,
    additionalConditions
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
  const [testAdminIndex, setTestAdminIndex] = useState(0);
  const router = useRouter();

  // ID админов для тестирования в браузере
  const testAdminIds = ['1', '296925626', '531360988'];


  // Предзагрузка изображений отключена на главной странице для стабильности
  // Оптимизация работает на страницах condition и additional-condition
  
  // Условно вызываем useSafeArea только если мы в Telegram
  const safeAreaHook = useSafeArea();
  const { forceFullscreen, isFullscreen } = safeAreaHook;

  useEffect(() => {
    // Принудительно вызываем fullscreen при загрузке страницы только если мы в Telegram
    if (!isFullscreen && window.Telegram?.WebApp && isInTelegram) {
      console.log('Page loaded, forcing fullscreen at', new Date().toISOString());
      forceFullscreen();
    }
  }, [isInTelegram, isFullscreen, forceFullscreen]);

  // Отдельный useEffect для инициализации Telegram ID
  useEffect(() => {
    if (isInTelegram && window.Telegram?.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser?.id) {
        const tgId = tgUser.id.toString();
        setTelegramId(tgId);
        
        if (tgId === '1' || tgId === '296925626' || tgId === '531360988') {
          setRole('master', parseInt(tgId));
        } else {
          setRole('client', parseInt(tgId));
        }
      }
    } else if (isInTelegram === false) {
      // Fallback для тестирования в браузере
      // Используем ID админа для тестирования
      const testId = testAdminIds[testAdminIndex]; 
      setTelegramId(testId);
      setRole('master', parseInt(testId));
    } else if (isInTelegram === null) {
      // Если isInTelegram === null, принудительно устанавливаем false
      setIsInTelegram(false);
    }
  }, [isInTelegram, setTelegramId, setRole, testAdminIndex]);

  // Дополнительный useEffect для восстановления telegramId из sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !telegramId) {
      const savedTelegramId = sessionStorage.getItem('telegramId');
      if (savedTelegramId) {
        setTelegramId(savedTelegramId);
        // Проверяем, является ли пользователь мастером по ID
        const isMasterUser = testAdminIds.includes(savedTelegramId);
        if (isMasterUser) {
          setRole('master', parseInt(savedTelegramId));
        } else {
          setRole('client', parseInt(savedTelegramId));
        }
      }
    }
  }, [telegramId, setTelegramId, setRole]);

  // Проверяем сохраненные данные и перенаправляем на нужный шаг
  useEffect(() => {
  // Проверяем, запущено ли приложение в Telegram
  const checkTelegram = () => {
    if (typeof window !== 'undefined') {
      // Простая проверка - если есть Telegram.WebApp, то это WebApp
      const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
      const hasTelegramWebviewProxy = !!(window as any).TelegramWebviewProxy;
      
      // Если есть Telegram.WebApp ИЛИ TelegramWebviewProxy, то это WebApp
      const inTelegram = hasTelegramWebApp || hasTelegramWebviewProxy;
      
      setIsInTelegram(inTelegram);
      setIsLoading(false);
      
      if (inTelegram) {
        // Если мы в Telegram, получаем данные пользователя
        const userData = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (userData) {
          const telegramUserId = userData.id?.toString();
          const telegramUsername = userData.username;
          
          if (telegramUserId) {
            console.log('✅ Получен telegramId из Telegram WebApp:', telegramUserId);
            setTelegramId(telegramUserId);
            
            // Проверяем, является ли пользователь мастером
            const isMasterUser = testAdminIds.includes(telegramUserId);
            if (isMasterUser) {
              setRole('master', parseInt(telegramUserId));
            } else {
              setRole('client', parseInt(telegramUserId));
            }
            
            // Сохраняем в sessionStorage
            sessionStorage.setItem('telegramId', telegramUserId);
            if (telegramUsername) {
              sessionStorage.setItem('telegramUsername', telegramUsername);
            }
          }
        }
      } else {
        // Если мы не в Telegram, принудительно устанавливаем false
        setIsInTelegram(false);
        // Устанавливаем тестовый ID для браузера
        const testId = testAdminIds[testAdminIndex];
        setTelegramId(testId);
        setRole('master', parseInt(testId));
      }
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
          case 'delivery-options':
            router.push('/request/delivery-options');
            return;
          case 'pickup-points':
            router.push('/request/pickup-points');
            return;
          case 'final':
            router.push('/request/final');
            return;
          default:
            break;
        }
      }

      // 5. Fallback: определяем шаг на основе сохраненных данных
      
      // Если нет currentStep, определяем по заполненным данным
      if (draftData?.deliveryMethod) {
        // Есть данные о доставке - определяем по deliveryMethod
        if (draftData.deliveryMethod === 'pickup' && draftData.pickupPoint) {
          router.push('/request/pickup-points');
          return;
        } else if (draftData.deliveryMethod === 'courier' && draftData.courierAddress && draftData.courierDate && draftData.courierTime) {
          router.push('/request/courier-booking');
          return;
        } else {
          router.push('/request/delivery-options');
          return;
        }
      } else if (imei && serialNumber && modelname && deviceConditions && additionalConditions) {
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
            className="w-48 h-48 mx-auto mb-6 flex items-center justify-center"
          >
            <Image
              src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
              alt="Загрузка"
              width={192}
              height={192}
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
                src={getPictureUrl(`animation_logo2.gif`) || '/animation_logo2.gif'}
                alt="Логотип"
                width={400}
                height={200}
                className="w-full max-w-md h-auto object-contain mx-auto rounded-2xl shadow-lg"
                priority={true}
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
              
              

              {!isLoading && isMaster(userId) && (
                <>
                  <Button
                    variant="outline"
                    className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-medium text-base rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => router.push('/master')}
                  >
                    Для мастеров
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-14 bg-purple-500 hover:bg-purple-600 text-white font-medium text-base rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => router.push('/admin')}
                  >
                    Админ панель
                  </Button>
                </>
              )}

              {/* Кнопка для переключения ID админов в браузере */}
              {!isLoading && !isInTelegram && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => {
                    const nextIndex = (testAdminIndex + 1) % testAdminIds.length;
                    setTestAdminIndex(nextIndex);
                  }}
                >
                  Переключить ID админа: {testAdminIds[testAdminIndex]} (нажмите для смены)
                </Button>
              )}
              
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
          </div>
        </div>
      </div>

      {/* Оптимизация загрузки изображений работает на страницах condition и additional-condition */}

    </AdaptiveContainer>
  );
}

export default function Home() {
  return <HomeContent />;
}