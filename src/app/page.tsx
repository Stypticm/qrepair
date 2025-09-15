'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { Link } from '@/components/Link/Link';
import { Button } from '@/components/ui/button';

import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger, useMenubar } from '@/components/ui/menubar';
import { ExpandButton } from '@/components/ExpandButton';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore, isMaster, useFeatureFlags } from '@/stores/authStore';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';

function HomeContent() {
  // Всегда вызываем хук - это требование React
  const initDataState = useSignal(_initDataState);
  
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
    setUsername,
    setCurrentStep,
    clearSessionStorage,
    telegramId,
    username,
    modelname,
    imei,
    serialNumber,
    deviceConditions,
    additionalConditions,
    debugInfo,
    addDebugInfo,
    initializeTelegram
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
  const [testAdminIndex, setTestAdminIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  
  // Состояние для отладочной панели
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // ID админов для тестирования в браузере
  const testAdminIds = ['1', '296925626', '531360988'];

  // Отладочная информация теперь в Zustand store


  // Предзагрузка изображений отключена на главной странице для стабильности
  // Оптимизация работает на страницах condition и additional-condition
  
  // Условно вызываем useSafeArea только если мы в Telegram
  const safeAreaHook = useSafeArea();
  const { forceFullscreen, isFullscreen } = safeAreaHook;

  useEffect(() => {
    // Принудительно fullscreen только на мобильных ширинах
    const isMobileWidth = typeof window !== 'undefined' ? window.innerWidth < 768 : true;
    if (!isFullscreen && window.Telegram?.WebApp && isInTelegram && isMobileWidth) {
      forceFullscreen();
    }
  }, [isInTelegram, isFullscreen, forceFullscreen]);

  // Прелоад раздела мастеров для ускорения
  useEffect(() => {
    if (!isLoading && isMaster(userId)) {
      try {
        router.prefetch('/master/points');
      } catch {}
    }
  }, [isLoading, userId, router]);

  // Управление состоянием иконки (shadcn-like menubar)

  // Инициализация Telegram WebApp
  useEffect(() => {
    addDebugInfo('Запуск инициализации Telegram WebApp');
    
    if (typeof window !== 'undefined') {
      const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
      const hasTelegramWebviewProxy = !!(window as any).TelegramWebviewProxy;
      const inTelegram = hasTelegramWebApp || hasTelegramWebviewProxy;
      
      addDebugInfo(`hasTelegramWebApp: ${hasTelegramWebApp}`);
      addDebugInfo(`hasTelegramWebviewProxy: ${hasTelegramWebviewProxy}`);
      addDebugInfo(`inTelegram: ${inTelegram}`);
      
      setIsInTelegram(inTelegram);
      setIsLoading(false);
      
      if (inTelegram) {
                    // Инициализируем Telegram данные через Zustand
                    initializeTelegram(initDataState);
                } else {
        // Fallback для браузера
        addDebugInfo('Браузерный режим - используем fallback ID');
        const testId = testAdminIds[testAdminIndex]; 
        setTelegramId(testId);
        setRole('master', parseInt(testId));
      }
    }
  }, [initializeTelegram, setTelegramId, setRole, testAdminIndex]);

  // Восстанавливаем данные из sessionStorage
  useEffect(() => {
    const savedStep = sessionStorage.getItem('currentStep');
    const savedTelegramId = sessionStorage.getItem('telegramId');
    const savedUsername = sessionStorage.getItem('telegramUsername');
    
    addDebugInfo(`Восстановление из sessionStorage:`);
    addDebugInfo(`- currentStep: ${savedStep || 'НЕТ'}`);
    addDebugInfo(`- telegramId: ${savedTelegramId || 'НЕТ'}`);
    addDebugInfo(`- username: ${savedUsername || 'НЕТ'}`);
    
    if (savedStep) {
      setCurrentStep(savedStep);
    }
    
    // Восстанавливаем данные пользователя только если они не были установлены через Telegram
    if (savedTelegramId && !telegramId) {
      setTelegramId(savedTelegramId);
      addDebugInfo(`✅ Восстановлен telegramId из sessionStorage: ${savedTelegramId}`);
    }
    
    if (savedUsername && !username) {
      setUsername(savedUsername);
      addDebugInfo(`✅ Восстановлен username из sessionStorage: ${savedUsername}`);
    }
  }, [setCurrentStep, setTelegramId, setUsername, telegramId, username, addDebugInfo]);

  // Логика инициализации теперь в Zustand store



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

      
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50 pt-28">
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
              
              {/* Лента моделей на продажу (заглушки) */}
              <MarketplaceFeed />

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

              {/* Кнопка админ панели убрана, используем плавающую шестерёнку */}

              {/* Панель отладки перенесена на /internal */}

              {/* Отладочная информация */}

              
            </div>
          </div>

          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2 flex flex-col gap-2">
            {/* Кнопка для принудительного расширения */}
            <ExpandButton className="w-full" />
          </div>

          {/* Плавающая круглая кнопка для мастеров */}
          {!isLoading && isMaster(userId) && (
            <button
              onClick={() => router.push('/internal')}
              className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition"
              aria-label="Открыть админ панель"
            >
              ⚙️
            </button>
          )}

          {/* Гамбургер-меню */}
          <div className="fixed top-24 right-5 z-50">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger
                  aria-label="Открыть меню"
                  className="w-12 h-12 rounded-full bg-gray-900/80 text-white shadow-md flex items-center justify-center active:scale-95 transition"
                >
                  {/* Иконка остаётся фиксированной, не двигается вместе с меню */}
                  {menuOpen ? '✕' : '☰'}
                </MenubarTrigger>
                <MenubarContent className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <MenubarItem
                    className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                    onSelect={() => {
                      router.push('/my-devices');
                    }}
                  >
                    Мои устройства
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
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

// Компонент ленты моделей (заглушки)
function MarketplaceFeed() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const router = useRouter();

  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `iPhone ${i + 8}`,
    price: `${(49990 + i * 1000).toLocaleString('ru-RU')} ₽`,
    image: '/logo3.png',
    isNew: i % 4 === 0,
    hasDiscount: i % 3 === 0,
  }));

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)] overflow-hidden transition will-change-transform hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_rgba(0,0,0,0.10)]"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/market/${item.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/market/${item.id}`);
              }
            }}
          >
            <div className="relative w-full h-32 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.title}
                width={180}
                height={128}
                className="object-contain w-full h-full p-4"
              />
            </div>
            <div className="p-3 text-left">
              <div className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em] truncate">
                {item.title}
              </div>
              <div className="text-[12px] text-gray-500 mt-1">
                {item.price}
              </div>
              <div className="mt-2 flex items-center justify-end gap-1.5">
                {item.hasDiscount && (
                  <span className="inline-flex items-center px-2 h-6 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">Скидка</span>
                )}
                {item.isNew && (
                  <span className="inline-flex items-center px-2 h-6 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">Новый</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < items.length && (
        <Button
          variant="outline"
          disabled={isLoadingMore}
          className="relative mt-4 w-full h-12 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => {
            setIsLoadingMore(true);
            setTimeout(() => {
              setVisibleCount((c) => Math.min(c + 6, items.length));
              setIsLoadingMore(false);
            }, 500);
          }}
        >
          {isLoadingMore ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Загрузка...
            </span>
          ) : (
            'Показать ещё'
          )}
        </Button>
      )}
    </div>
  );
}