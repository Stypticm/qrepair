'use client';

export const dynamic = 'force-dynamic';

// TODO: Uncomment for swipe navigation
// import { motion } from 'framer-motion';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

import { useAppStore, isMaster } from '@/stores/authStore';

import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { postEvent } from '@telegram-apps/sdk';
import { bindViewportCssVars } from '@telegram-apps/sdk';
import { useTelegramCloudImages } from '@/hooks/useTelegramCloudImages'

// TODO: Uncomment for swipe navigation
// import { useNavigation } from './navigation/NavigationProvider';
// import { useKeyboardNavigation } from './navigation/useKeyboardNavigation';
// import { useSwipeNavigation } from './navigation/useSwipeNavigation';
import MenuComponent from '@/components/Menu/MenuComponent';
// TODO: Uncomment for swipe navigation
// import { SwipeHint } from '@/components/SwipeHint/page';

function HomeContent() {
  // TODO: Uncomment for swipe navigation
  // useKeyboardNavigation();
  // useSwipeNavigation();
  // const { position } = useNavigation()

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

  const [screenHeight, setScreenHeight] = useState(0);

  // TODO: Uncomment for swipe navigation
  // const [showHint, setShowHint] = useState(() => {
  //   if (typeof window === 'undefined') return false
  //   return sessionStorage.getItem('swipe-hint') !== 'hidden'
  // })

  // Marketplace Feed state
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

  // ViewMode state для управления видимостью баннера
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const router = useRouter();
  const { getImage } = useTelegramCloudImages();
  const testAdminIds = useMemo(() => ['1', '296925626', '531360988'], []);

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
      // Функция настройки Telegram фич
      const setupTelegramFeatures = () => {
        initializeTelegram(initDataState);

        // КРИТИЧЕСКИ ВАЖНО: Управление свайпами ДО ready()
        // Это должно быть сделано как можно раньше, чтобы предотвратить сворачивание
        try {
          const wa: any = window.Telegram?.WebApp;
          const platform = wa?.platform;
          const isMobilePlatform = platform === 'android' || platform === 'ios';
          const isDesktopPlatform = !isMobilePlatform && (
            platform === 'tdesktop' ||
            platform === 'macos' ||
            platform === 'web' ||
            platform === 'weba' ||
            platform === 'windows' ||
            platform === 'linux'
          );

          // На мобильных - отключаем свайп вниз для закрытия ПЕРЕД ready()
          if (isMobilePlatform) {
            try {
              // ВАЖНО: Включаем подтверждение закрытия ДО ready() для максимальной защиты
              // Это покажет диалог с кнопками "Всё равно закрыть" и "Отмена" при попытке закрыть
              try {
                if (typeof wa?.enableClosingConfirmation === 'function') {
                  wa.enableClosingConfirmation();
                  addDebugInfo(`enableClosingConfirmation применён ДО ready() - isClosingConfirmationEnabled: ${wa?.isClosingConfirmationEnabled}`);
                }
              } catch (e) {
                console.warn('enableClosingConfirmation недоступен ДО ready():', e);
              }

              if (typeof wa?.disableVerticalSwipes === 'function') {
                wa.disableVerticalSwipes();

                // Проверяем, что настройка применилась
                const isEnabled = wa?.isVerticalSwipesEnabled;
                addDebugInfo(`disableVerticalSwipes применён ДО ready() - isVerticalSwipesEnabled: ${isEnabled}`);

                // Если все еще включено, пробуем еще раз
                if (isEnabled === true) {
                  setTimeout(() => {
                    wa.disableVerticalSwipes();
                    addDebugInfo(`Повторный вызов disableVerticalSwipes ДО ready() - isVerticalSwipesEnabled: ${wa?.isVerticalSwipesEnabled}`);
                  }, 100);
                }
              }
            } catch (error) {
              console.error('disableVerticalSwipes failed:', error);
            }
          }

          // Вызываем ready() - это уведомляет Telegram о готовности приложения
          try {
            wa?.ready?.();
          } catch { }

          // После ready() - повторно применяем настройки свайпов для надежности
          const applySwipeSettings = () => {
            try {
              if (isMobilePlatform) {
                // На мобильных - отключаем только свайп вниз для закрытия приложения
                if (typeof wa?.disableVerticalSwipes === 'function') {
                  wa.disableVerticalSwipes();

                  // Проверяем, что настройка применилась (Bot API 7.7+)
                  const isEnabled = wa?.isVerticalSwipesEnabled;
                  addDebugInfo(`disableVerticalSwipes применён ПОСЛЕ ready() - isVerticalSwipesEnabled: ${isEnabled}`);

                  // Если все еще включено, пробуем еще раз
                  if (isEnabled === true) {
                    console.warn('⚠️ isVerticalSwipesEnabled все еще true, повторная попытка...');
                    setTimeout(() => {
                      wa.disableVerticalSwipes();
                      const newState = wa?.isVerticalSwipesEnabled;
                      addDebugInfo(`Повторный вызов disableVerticalSwipes - isVerticalSwipesEnabled: ${newState}`);
                    }, 100);
                  }

                  // Дополнительная защита: включаем подтверждение закрытия
                  // Это покажет диалог с кнопками "Всё равно закрыть" и "Отмена" при попытке закрыть
                  try {
                    if (typeof wa?.enableClosingConfirmation === 'function') {
                      wa.enableClosingConfirmation();
                      const isEnabled = wa?.isClosingConfirmationEnabled;
                      addDebugInfo(`enableClosingConfirmation применён - isClosingConfirmationEnabled: ${isEnabled}`);

                      // Если не включено, пробуем еще раз
                      if (isEnabled === false) {
                        setTimeout(() => {
                          wa.enableClosingConfirmation();
                          addDebugInfo(`Повторный вызов enableClosingConfirmation - isClosingConfirmationEnabled: ${wa?.isClosingConfirmationEnabled}`);
                        }, 100);
                      }
                    }
                  } catch (e) {
                    console.warn('enableClosingConfirmation недоступен:', e);
                  }

                  // Дополнительные ретраи для надежности
                  const retryClosingConfirmation = () => {
                    try {
                      if (typeof wa?.enableClosingConfirmation === 'function') {
                        wa.enableClosingConfirmation();
                      }
                    } catch { }
                  };
                  setTimeout(retryClosingConfirmation, 300);
                  setTimeout(retryClosingConfirmation, 1000);
                }
              } else if (isDesktopPlatform) {
                // На десктопе - ВКЛЮЧАЕМ свайпы для работы на тачпаде
                if (typeof wa?.enableVerticalSwipes === 'function') {
                  wa.enableVerticalSwipes();
                  addDebugInfo('enableVerticalSwipes применён (десктоп платформа)');
                }
              }
            } catch { }
          };

          applySwipeSettings();
          // ретраи на случай ленивой инициализации клиента
          setTimeout(applySwipeSettings, 300);
          setTimeout(applySwipeSettings, 1000);

          // Защита от свайпа вниз в начале страницы (scrollY === 0)
          // Когда пользователь в начале страницы, свайп вниз может восприниматься как жест на сворачивание
          if (isMobilePlatform) {
            const preventCollapseOnTopSwipe = () => {
              // Если мы в начале страницы, немного прокручиваем вниз
              if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
                window.scrollTo({ top: 1, behavior: 'instant' });
              }
            };

            // Проверяем при загрузке
            setTimeout(preventCollapseOnTopSwipe, 100);

            // Перехватываем touchstart в начале страницы
            const handleTouchStart = (e: TouchEvent) => {
              if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
                // Небольшая прокрутка вниз, чтобы предотвратить сворачивание
                window.scrollTo({ top: 1, behavior: 'instant' });
              }
            };

            document.addEventListener('touchstart', handleTouchStart, { passive: true });
          }
        } catch (e) {
          // Фоллбек через postEvent, если метод недоступен (только для мобильных)
          try {
            const wa: any = window.Telegram?.WebApp;
            const platform = wa?.platform;
            const isMobilePlatform = platform === 'android' || platform === 'ios';
            if (isMobilePlatform) {
              postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
            }
          } catch { }
        }
        // Привяжем CSS переменные viewport (влияет на безопасные отступы)
        try {
          if ((bindViewportCssVars as any)?.isAvailable?.() || true) {
            bindViewportCssVars();
          }
        } catch { }
      };

      // Функция проверки Telegram с несколькими способами
      const checkTelegram = () => {
        const tg = (window as any).Telegram?.WebApp;
        // Важно: проверяем платформу, так как скрипт загружается везде, но platform='unknown' в браузере
        const hasTelegramWebApp = !!tg && tg.platform && tg.platform !== 'unknown';
        const hasTelegramWebviewProxy = !!(window as any).TelegramWebviewProxy;

        // Дополнительная проверка через initData в cookies (Telegram передает это)
        const initDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('_initData='));
        const hasInitData = !!initDataCookie;

        // Проверка через URL параметры (Telegram может передавать tgWebAppStartParam)
        const urlParams = new URLSearchParams(window.location.search);
        const hasTelegramParams = urlParams.has('tgWebAppStartParam') || urlParams.has('tgWebAppVersion');

        const inTelegram = hasTelegramWebApp || hasTelegramWebviewProxy || hasInitData || hasTelegramParams;

        addDebugInfo(`hasTelegramWebApp: ${hasTelegramWebApp} (platform: ${tg?.platform})`);
        addDebugInfo(`hasTelegramWebviewProxy: ${hasTelegramWebviewProxy}`);
        addDebugInfo(`hasInitData: ${hasInitData}`);
        addDebugInfo(`hasTelegramParams: ${hasTelegramParams}`);
        addDebugInfo(`inTelegram: ${inTelegram}`);

        return inTelegram;
      };

      // Первая проверка сразу
      let inTelegram = checkTelegram();

      // Если не определили, ждем немного и проверяем снова (SDK может инициализироваться с задержкой)
      if (!inTelegram) {
        setTimeout(() => {
          inTelegram = checkTelegram();
          setIsInTelegram(inTelegram);
          setIsLoading(false);

          if (inTelegram) {
            setupTelegramFeatures();
          } else {
            // Только после повторной проверки редиректим
            addDebugInfo('Браузерный режим - используем fallback ID');
            const testId = testAdminIds[testAdminIndex];
            setTelegramId(testId);
            setRole('master', parseInt(testId));
          }
        }, 1000); // Даем 1 секунду на инициализацию SDK
      } else {
        setIsInTelegram(inTelegram);
        setIsLoading(false);
        setupTelegramFeatures();
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, marketplaceItems.length, marketplaceLoading]);

  // Слушатель для автообновления после добавления лота
  useEffect(() => {
    const handleLotAdded = () => {
      console.log('Lot added, refreshing marketplace...');
      refreshMarketplaceItems();
    };

    window.addEventListener('lotAdded', handleLotAdded);

    return () => {
      window.removeEventListener('lotAdded', handleLotAdded);
    };
  }, [refreshMarketplaceItems]);

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

  // Не редиректим сразу - даем время на инициализацию
  // Редирект убран для поддержки браузерного режима
  // if (isInTelegram === false && !isLoading) { ... }



  return (
    <AdaptiveContainer>
      <div className={`${isDesktopLike ? 'flex justify-center' : ''}`}>
        <div className="w-full max-w-[420px]">
          <div className={`${isDesktopLike ? 'max-h-[900px] overflow-auto' : ''}`}>
            <div
              className={`w-full ${isDesktopLike ? 'max-w-[520px]' : 'max-w-[480px]'} mx-auto min-h-screen bg-gradient-to-b from-white to-gray-50 pt-2 pb-24 px-4 box-border`}
            >
              {/* Баннер - показывается только в режиме carousel (Рекомендации) */}
              {viewMode === 'carousel' && (
                <div className="w-full flex justify-center mb-6">
                  <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                </div>
              )}

              {/* Feed */}
              <div className="w-full">
                <AdaptiveDeviceFeed
                  items={marketplaceItems}
                  isLoading={marketplaceLoading}
                  onLoadMore={loadMoreMarketplaceItems}
                  hasMore={marketplaceHasMore}
                  mode="auto"
                  onViewModeChange={setViewMode}
                />
              </div>

              {/* TODO: Uncomment for swipe navigation */}
              {/* <motion.div
                className="absolute inset-0"
                animate={{ x: `${position.x * -100}%`, y: `${position.y * -100}%` }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: 'tween',
                  stiffness: 100,
                  damping: 20
                }}
                style={{
                  willChange: 'transform',
                  touchAction: 'pan-x pan-y'
                }}
              >
                <div className="absolute inset-0 p-4">
                  <div className={`flex flex-col ${adaptiveGap} ${adaptivePadding} w-full h-full`}>
                    <div className="w-full flex justify-center">
                      <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                    </div>
                    {position.x === 0 && position.y === 0 && (
                      <div className="flex flex-1 items-center justify-center pointer-events-none">
                        <SwipeHint />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Нижнее меню */}
      {/* TODO: Uncomment condition for swipe navigation: (position.x === 0 && (position.y === 0 || position.y === 1)) && */}
      <MenuComponent userId={userId as number} router={router} isLoading={isLoading} />

      {/* PWA Prompt only for mobile browsers (not in Telegram) */}
      {!isInTelegram && <PWAInstallPrompt />}
    </AdaptiveContainer >
  );
}

export default function Home() {
  return <HomeContent />;
}