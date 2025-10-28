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
import { bindViewportCssVars, requestFullscreen, exitFullscreen, isFullscreen, mountSwipeBehavior, disableVerticalSwipes, isSwipeBehaviorMounted } from '@telegram-apps/sdk';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Smartphone, Wrench, Smartphone as DevicesIcon, Heart, ShoppingCart, Settings } from 'lucide-react';
import { useTelegramCloudImages } from '@/hooks/useTelegramCloudImages'
import { RotatingBanner } from '@/components/RotatingBanner'

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
  const [isGridViewMode, setIsGridViewMode] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);

  // Состояние для marketplace
  const [marketplaceItems, setMarketplaceItems] = useState<Array<{ 
    id: string; 
    title: string; 
    price: number | null; 
    date: string; 
    cover: string | null;
    photos: string[];
    model?: string;
    storage?: string;
    color?: string;
    condition?: string;
    description?: string;
  }>>([]);
  const [marketplaceOffset, setMarketplaceOffset] = useState(0);
  const marketplaceOffsetRef = useRef(0);
  const [marketplaceHasMore, setMarketplaceHasMore] = useState(true);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  const router = useRouter();
  const { forceFullscreen, isFullscreen } = useSafeArea();
  const { getImage } = useTelegramCloudImages();
  const testAdminIds = useMemo(() => ['1', '296925626', '531360988'], []);

  // Функция загрузки marketplace данных
  const loadMoreMarketplaceItems = useCallback(async () => {
    console.log('Loading marketplace items...');
    setMarketplaceLoading(true);
    try {
      const limit = 12;
      const currentOffset = marketplaceOffsetRef.current;
      console.log('Fetching from API with offset:', currentOffset);
      const res = await fetch(`/api/market/feed?limit=${limit}&offset=${currentOffset}`, { cache: 'no-store' });
      const data = await res.json();
      console.log('API response:', data);
      if (!res.ok) throw new Error(data?.error || 'Failed to load feed');

      const newItems = Array.isArray(data.items) ? data.items : [];
      console.log('New items loaded:', newItems.length);
      setMarketplaceItems((prev) => {
        const updated = [...prev, ...newItems];
        console.log('Total items after update:', updated.length);
        return updated;
      });
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
  }, []);

  // Функция обновления marketplace данных (для автообновления)
  const refreshMarketplaceItems = useCallback(async () => {
    setMarketplaceLoading(true);
    try {
      const limit = 12;
      const res = await fetch(`/api/market/feed?limit=${limit}&offset=0`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to refresh feed');

      const newItems = Array.isArray(data.items) ? data.items : [];
      setMarketplaceItems(newItems);
      marketplaceOffsetRef.current = newItems.length;
      setMarketplaceOffset(newItems.length);
      setMarketplaceHasMore(false);
    } catch (e) {
      console.error('Feed refresh error', e);
    } finally {
      setMarketplaceLoading(false);
    }
  }, []);

  // Загружаем данные при инициализации
  useEffect(() => {
    if (!isLoading && marketplaceItems.length === 0 && marketplaceOffsetRef.current === 0 && !marketplaceLoading) {
      loadMoreMarketplaceItems();
    }
    // намеренно не добавляем loadMoreMarketplaceItems в зависимости, чтобы не триггерить повторно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, marketplaceItems.length, marketplaceLoading]);

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

  // Слушатель для автообновления после добавления лота
  useEffect(() => {
    const handleLotAdded = () => {
      console.log('Lot added, refreshing marketplace...');
      refreshMarketplaceItems();
    };

    // Слушаем событие добавления лота
    window.addEventListener('lotAdded', handleLotAdded);
    
    return () => {
      window.removeEventListener('lotAdded', handleLotAdded);
    };
  }, [refreshMarketplaceItems]);

  // Отслеживание высоты экрана для адаптивного gap
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateScreenHeight = () => {
        setScreenHeight(window.innerHeight);
      };
      
      updateScreenHeight();
      window.addEventListener('resize', updateScreenHeight);
      
      return () => window.removeEventListener('resize', updateScreenHeight);
    }
  }, []);

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

      if (inTelegram) {
        initializeTelegram(initDataState);
        // Официальный API SwipeBehavior: монтируем и отключаем вертикальные свайпы
        try {
          if ((mountSwipeBehavior as any)?.isAvailable?.()) {
            mountSwipeBehavior();
          }
          const applyDisable = () => {
            try {
              if ((disableVerticalSwipes as any)?.isAvailable?.()) disableVerticalSwipes();
              addDebugInfo('SwipeBehavior: disableVerticalSwipes применён');
            } catch {}
          };
          applyDisable();
          // ретраи на случай ленивого инициализации клиента
          setTimeout(applyDisable, 300);
          setTimeout(applyDisable, 1000);
        } catch (e) {
          // Фоллбек через postEvent, если компонент недоступен
          try { postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false }); } catch {}
        }
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
      // cleanup
      return () => window.removeEventListener('resize', detectDesktop);
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

  // Мемоизированный массив баннеров для предотвращения перерендеров
  const bannerList = useMemo(() => ['banner.png', 'banner2.png'], []);

  // Мемоизированные функции для предотвращения перерендеров
  const adaptiveGap = useMemo(() => {
    if (screenHeight > 910) return 'gap-6';
    return 'gap-3';
  }, [screenHeight]);

  const adaptivePadding = useMemo(() => {
    if (screenHeight < 850) return 'pb-20';
    return '';
  }, [screenHeight]);

  const handleStartForm = useCallback(async () => {
    try {
      // Всегда начинаем с выбора способа оценки
      resetAllStates();
      // подчистим возможные хвосты
      sessionStorage.removeItem('currentStep');
      sessionStorage.removeItem('phoneSelection');
      sessionStorage.removeItem('priceRange');
      sessionStorage.removeItem('prefillSelection');
      setCurrentStep('evaluation-mode');
      router.push('/request/evaluation-mode');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
      router.push('/request/evaluation-mode');
    }
  }, [router, resetAllStates, setCurrentStep]);

  // Мемоизированные обработчики для кнопок
  const handleRepairClick = useCallback(() => {
    // Ручной поток оценки: ввод серийного и выбор модели
    router.push('/request/device-info');
  }, [router]);

  const handleTestAdminToggle = useCallback(() => {
    const nextIndex = (testAdminIndex + 1) % testAdminIds.length;
    setTestAdminIndex(nextIndex);
  }, [testAdminIndex, testAdminIds.length]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'carousel') => {
    setIsGridViewMode(mode === 'grid');
  }, []);

  if (isInTelegram === null) {
    return (
      <AdaptiveContainer>
        <div className="w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          <img
            src={getImage('animation_running.gif') || '/animation_running.gif'}
            alt="Загрузка"
            width={64}
            height={64}
            className="object-contain rounded-2xl"
            style={{ imageRendering: 'auto' }}
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
            <div className={`w-full ${isDesktopLike ? 'max-w-[520px]' : 'max-w-[480px]'} mx-auto min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-white to-gray-50 pt-2 box-border`}>
              <div className="w-full text-center space-y-2 mt-6">

                <div className={`flex flex-col ${adaptiveGap} ${adaptivePadding} w-full h-full`}>
                  <div className="w-full flex justify-center">
                    <RotatingBanner
                      banners={bannerList}
                      interval={5000} // 5 секунд между сменами
                      screenHeight={screenHeight}
                    />
                  </div>
                  <AdaptiveDeviceFeed
                    items={marketplaceItems}
                    isLoading={marketplaceLoading}
                    onLoadMore={loadMoreMarketplaceItems}
                    hasMore={marketplaceHasMore}
                    mode="auto"
                    onViewModeChange={handleViewModeChange}
                  />
                  
                  {/* Кнопки Ремонт и Оценка с логотипом - только в carousel режиме */}
                  {!isGridViewMode && (
                    <div className="w-full px-2">
                      <div className="w-full max-w-md mx-auto flex items-center justify-center gap-2">
                        {/* Кнопка Оценка (ручной поток) */}
                        <Button
                          variant="outline"
                          className="group flex-1 h-16 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] hover:from-[#ff5252] hover:to-[#ff7979] text-white font-semibold rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                          onClick={handleRepairClick}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Wrench className="w-6 h-6 text-white" />
                            <span className="text-white font-semibold text-base">Оценка</span>
                          </div>
                        </Button>

                        {/* Логотип */}
                        <div 
                          className="w-[60px] h-[60px] bg-white rounded-full shadow-lg grid place-items-center overflow-hidden mx-2 cursor-pointer hover:shadow-xl transition-all duration-300 active:scale-95"
                          onClick={() => {
                            const event = new CustomEvent('switchToGrid');
                            window.dispatchEvent(event);
                          }}
                        >
                          <img
                            src={getImage('animation_logo2.gif') || '/animation_logo2.gif'}
                            alt="Логотип"
                            width={80}
                            height={80}
                            className="w-[60px] h-[60px] object-cover bg-white"
                            style={{ imageRendering: 'auto' }}
                          />
                        </div>

                        {/* Кнопка Тест (быстрый переход в evaluation-mode) — только для админов */}
                        {isMaster(userId) && (
                          <Button
                            variant="outline"
                            className="group flex-1 h-16 bg-gradient-to-r from-[#2dc2c6] to-[#4fd1d5] hover:from-[#25a8ac] hover:to-[#39c4c8] text-white font-semibold rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-pulse"
                            onClick={handleStartForm}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Smartphone className="w-6 h-6 text-white" />
                              <span className="text-white font-semibold text-base">Тест</span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!isLoading && !isInTelegram && (
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={handleTestAdminToggle}
                    >
                      Переключить ID админа: {testAdminIds[testAdminIndex]}
                    </Button>
                  )}
                </div>

                {/* ExpandButton - только в grid режиме */}
                {isGridViewMode && (
                  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2 flex flex-col gap-2">
                    <ExpandButton className="w-full" />
                  </div>
                )}

                {/* Фиксированное нижнее меню в стиле Apple Liquid Design */}
                <div className="fixed bottom-4 left-4 right-4 z-50">
                  <div className="relative">
                    {/* Внешняя тень для глубины */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-xl"></div>
                    
                    {/* Основной контейнер с многослойностью */}
                    <div className="relative bg-gradient-to-r from-white/8 via-white/12 to-white/8 backdrop-blur-3xl border border-white/20 rounded-full px-6 py-4 shadow-2xl">
                      {/* Внутренний градиент для объема */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>
                      
                      {/* Контент меню */}
                      <div className={`relative max-w-md mx-auto flex ${!isLoading && isMaster(userId) ? 'justify-around' : 'justify-evenly'} items-center`}>
                        {/* Мои устройства */}
                        <button
                          onClick={() => router.push('/my-devices')}
                          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                          aria-label="Мои устройства"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                          <DevicesIcon className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                        </button>

                        {/* Избранное */}
                        <button
                          onClick={() => router.push('/favorites')}
                          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                          aria-label="Избранное"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                          <Heart className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                        </button>

                        {/* Корзина */}
                        <button
                          onClick={() => router.push('/cart')}
                          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                          aria-label="Корзина"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                          <ShoppingCart className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                        </button>

                        {/* Системная кнопка для админов */}
                        {!isLoading && isMaster(userId) && (
                          <button
                            onClick={() => router.push('/internal')}
                            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/90 to-purple-700/80 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-purple-500/90 hover:to-purple-600/80 shadow-lg"
                            aria-label="Открыть админ панель"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                            <Settings className="relative w-6 h-6 text-white drop-shadow-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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