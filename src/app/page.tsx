'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { Menubar, MenubarContent, MenubarItem, MenubarTrigger } from '@/components/ui/menubar';
import { ExpandButton } from '@/components/ExpandButton';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore, isMaster } from '@/stores/authStore';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { postEvent } from '@telegram-apps/sdk';
import { bindViewportCssVars, requestFullscreen, exitFullscreen, isFullscreen } from '@telegram-apps/sdk';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Smartphone } from 'lucide-react';

function HomeContent() {
  const initDataState = useSignal(_initDataState);
  const {
    setRole,
    userId,
    setTelegramId,
    setUsername,
    setCurrentStep,
    initializeTelegram,
    addDebugInfo,
    resetAllStates,
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
  const [isDesktopLike, setIsDesktopLike] = useState(false);
  const [testAdminIndex, setTestAdminIndex] = useState(0);

  // Состояние для marketplace
  const [marketplaceItems, setMarketplaceItems] = useState<Array<{ id: string; title: string; price: number | null; date: string; cover: string | null }>>([]);
  const [marketplaceOffset, setMarketplaceOffset] = useState(0);
  const marketplaceOffsetRef = useRef(0);
  const [marketplaceHasMore, setMarketplaceHasMore] = useState(true);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  const router = useRouter();
  const { forceFullscreen, isFullscreen } = useSafeArea();
  const testAdminIds = useMemo(() => ['1', '296925626', '531360988'], []);

  // Функция загрузки marketplace данных
  const loadMoreMarketplaceItems = useCallback(async () => {
    if (marketplaceLoading) return;
    setMarketplaceLoading(true);
    try {
      const limit = 12;
      const currentOffset = marketplaceOffsetRef.current;
      const res = await fetch(`/api/market/feed?limit=${limit}&offset=${currentOffset}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load feed');

      const newItems = Array.isArray(data.items) ? data.items : [];
      setMarketplaceItems((prev) => [...prev, ...newItems]);
      const nextOffset = currentOffset + (newItems.length || 0);
      marketplaceOffsetRef.current = nextOffset;
      setMarketplaceOffset(nextOffset);
      // Мы хотим загрузить только один пакет из 12
      setMarketplaceHasMore(false);
    } catch (e) {
      console.error('Feed load error', e);
      setMarketplaceHasMore(false);
    } finally {
      setMarketplaceLoading(false);
    }
  }, [marketplaceLoading]);

  // Загружаем данные при инициализации
  useEffect(() => {
    if (!isLoading && marketplaceItems.length === 0 && marketplaceOffsetRef.current === 0) {
      loadMoreMarketplaceItems();
    }
    // намеренно не добавляем loadMoreMarketplaceItems в зависимости, чтобы не триггерить повторно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, marketplaceItems.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('start-over') === 'true') {
        sessionStorage.removeItem('start-over');
        router.push('/request/form');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading && isMaster(userId)) {
      try {
        router.prefetch('/master/points');
      } catch { }
    }
  }, [isLoading, userId, router]);

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

      // Детект десктопа для «оконного» вида (визуально)
      const detectDesktop = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isSmallMobile = w < 768;
        setIsDesktopLike(!isSmallMobile);
      };
      detectDesktop();
      window.addEventListener('resize', detectDesktop);
      // cleanup
      return () => window.removeEventListener('resize', detectDesktop);

      if (inTelegram) {
        initializeTelegram(initDataState);
        // Запрещаем вертикальный свайп для закрытия мини‑приложения
        try {
          postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
          addDebugInfo('Swipe behavior: allow_vertical_swipe=false применён');
        } catch (e) {
          console.error('Не удалось применить web_app_setup_swipe_behavior', e);
        }
        // Ретраи на случай, если телеграм применил поведение не сразу
        try {
          setTimeout(() => {
            try { postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false }); } catch {}
          }, 300);
          setTimeout(() => {
            try { postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false }); } catch {}
          }, 1000);
        } catch {}
        // Привяжем CSS переменные viewport (влияет на безопасные отступы)
        try {
          if ((bindViewportCssVars as any)?.isAvailable?.() || true) {
            bindViewportCssVars();
          }
        } catch { }
      } else {
        addDebugInfo('Браузерный режим - используем fallback ID');
        const testId = testAdminIds[testAdminIndex];
        setTelegramId(testId);
        setRole('master', parseInt(testId));
      }
    }
  }, [initializeTelegram, setTelegramId, setRole, testAdminIndex, addDebugInfo, initDataState, testAdminIds]);

  useEffect(() => {
    const savedStep = sessionStorage.getItem('currentStep');
    const savedTelegramId = sessionStorage.getItem('telegramId');
    const savedUsername = sessionStorage.getItem('telegramUsername');

    addDebugInfo(`Восстановление из sessionStorage:`);
    addDebugInfo(`- currentStep: ${savedStep || 'НЕТ'}`);
    addDebugInfo(`- telegramId: ${savedTelegramId || 'НЕТ'}`);
    addDebugInfo(`- username: ${savedUsername || 'НЕТ'}`);

    if (savedStep) setCurrentStep(savedStep);
    if (savedTelegramId && !useAppStore.getState().telegramId) setTelegramId(savedTelegramId);
    if (savedUsername && !useAppStore.getState().username) setUsername(savedUsername);
  }, [setCurrentStep, setTelegramId, setUsername, addDebugInfo]);

  const handleStartForm = async () => {
    try {
      const savedStep = sessionStorage.getItem('currentStep');
      const hasSerial = !!sessionStorage.getItem('serialNumber');
      const hasSelection = !!sessionStorage.getItem('phoneSelection');

      // Режим резюме: только если есть реальные данные выбора и шаг не device-info
      if (savedStep && savedStep !== 'device-info' && (hasSerial || hasSelection)) {
        router.push(`/request/${savedStep}`);
        return;
      }

      // Иначе начинаем заново с device-info
      resetAllStates();
      // подчистим возможные хвосты
      sessionStorage.removeItem('currentStep');
      sessionStorage.removeItem('phoneSelection');
      sessionStorage.removeItem('priceRange');
      sessionStorage.removeItem('prefillSelection');
      setCurrentStep('device-info');
      router.push('/request/device-info');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
      router.push('/request/device-info');
    }
  };


  if (isInTelegram === null) {
    return (
      <AdaptiveContainer>
        <div className="w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          <Image
            src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
            alt="Загрузка"
            width={192}
            height={192}
            className="object-contain rounded-2xl"
          />
          <p className="text-gray-600 mt-4">Инициализация...</p>
        </div>
      </AdaptiveContainer>
    );
  }

  if (isInTelegram === false) {
    router.push('/telegram');
    return null;
  }

  return (
    <AdaptiveContainer>
      <div className={`${isDesktopLike ? 'min-h-screen flex items-start justify-center p-6 md:p-8 bg-gray-100' : ''}`}>
        <div className={`${isDesktopLike ? 'w-full max-w-[520px] bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden' : ''}`}>
          <div className={`${isDesktopLike ? 'max-h-[900px] overflow-auto' : ''}`}>
            <div className={`w-full ${isDesktopLike ? 'max-w-[520px]' : 'max-w-[480px]'} mx-auto min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-white to-gray-50 pt-8 box-border`}>
              <div className=" w-full max-w-md mx-auto text-center space-y-4 mt-16">
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 70, damping: 12, duration: 2.2 }}
                  className="w-full"
                >
                  <div className="w-full max-w-md mx-auto flex justify-center">
                    <div className="w-[120px] h-[120px] bg-white rounded-full shadow-lg grid place-items-center overflow-hidden">
                      <Image
                        src={getPictureUrl('animation_logo2.gif') || '/animation_logo2.gif'}
                        alt="Логотип"
                        width={140}
                        height={140}
                        className="w-[120px] h-[120px] object-cover bg-white"
                        priority
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="flex flex-col gap-4 w-full">
                  <div className="w-full flex justify-center">
                    <Button
                      variant="outline"
                      className="group w-[82%] h-14 bg-gradient-to-r from-[#2dc2c6] to-[#4fd1d5] hover:from-[#25a8ac] hover:to-[#39c4c8] text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                      onClick={handleStartForm}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Оценить смартфон
                      </span>
                    </Button>
                  </div>
                  <AdaptiveDeviceFeed
                    items={marketplaceItems}
                    isLoading={marketplaceLoading}
                    onLoadMore={loadMoreMarketplaceItems}
                    hasMore={marketplaceHasMore}
                    mode="auto"
                  />
                  {!isLoading && !isInTelegram && (
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        const nextIndex = (testAdminIndex + 1) % testAdminIds.length;
                        setTestAdminIndex(nextIndex);
                      }}
                    >
                      Переключить ID админа: {testAdminIds[testAdminIndex]}
                    </Button>
                  )}
                </div>

                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2 flex flex-col gap-2">
                  <ExpandButton className="w-full" />
                </div>

                {!isLoading && isMaster(userId) && (
                  <button
                    onClick={() => router.push('/internal')}
                    className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition"
                    aria-label="Открыть админ панель"
                  >
                    ⚙️
                  </button>
                )}

                <div className="fixed top-22 right-5 z-50">
                  <Menubar>
                    <MenubarTrigger
                      aria-label="Открыть меню"
                      className="w-12 h-12 rounded-full bg-gray-900/80 text-white shadow-md flex items-center justify-center active:scale-95 transition"
                    >
                      ☰
                    </MenubarTrigger>
                    <MenubarContent className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                      <MenubarItem
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onSelect={() => router.push('/my-devices')}
                      >
                        📱 Мои устройства
                      </MenubarItem>
                      <MenubarItem
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onSelect={() => router.push('/market')}
                      >
                        🛒 Маркетплейс
                      </MenubarItem>
                      <MenubarItem
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onSelect={() => router.push('/favorites')}
                      >
                        ❤️ Избранное
                      </MenubarItem>
                      <MenubarItem
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onSelect={() => router.push('/profile')}
                      >
                        👤 Профиль
                      </MenubarItem>
                      <MenubarItem
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                        onSelect={() => router.push('/help')}
                      >
                        ❓ Помощь
                      </MenubarItem>
                    </MenubarContent>
                  </Menubar>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div>
    </AdaptiveContainer >
  );
}

export default function Home() {
  return <HomeContent />;
}