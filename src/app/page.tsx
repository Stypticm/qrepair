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
  // Свайповая матрица: (0,0) — центр (главное меню); (0,1) — лента; (1,0) — выбор; (-1,0) — ремонт; (0,-1) — FAQ
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const navigatingRef = useRef(false);
  const [instantTransition, setInstantTransition] = useState(false);
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
        const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
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

        addDebugInfo(`hasTelegramWebApp: ${hasTelegramWebApp}`);
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

  // Восстановление позиции домашней матрицы (например, вернуться к экрану Выбор)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') || sessionStorage.getItem('homePosition');
    if (section === 'choice') {
      setInstantTransition(true);
      setPosition({ x: 1, y: 0 });
      // очищаем флаг, чтобы не залипало
      sessionStorage.removeItem('homePosition');
      // выключаем мгновенный режим сразу после первого рендера
      setTimeout(() => setInstantTransition(false), 0);
    }
  }, []);

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

  // Навигация по матрице
  const goTo = useCallback((x: number, y: number) => setPosition({ x, y }), []);
  const goLeft = useCallback(() => { if (navigatingRef.current) return; setPosition((p) => ({ x: Math.max(-1, p.x - 1), y: p.y })); }, []);
  const goRight = useCallback(() => { if (navigatingRef.current) return; setPosition((p) => ({ x: Math.min(1, p.x + 1), y: p.y })); }, []);
  const goUp = useCallback(() => { if (navigatingRef.current) return; setPosition((p) => ({ x: p.x, y: Math.max(-1, p.y - 1) })); }, []);
  const goDown = useCallback(() => { if (navigatingRef.current) return; setPosition((p) => ({ x: p.x, y: Math.min(1, p.y + 1) })); }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const dx = touchStartRef.current.x - touchEndRef.current.x;
    const dy = touchStartRef.current.y - touchEndRef.current.y;
    const min = 40;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    if (navigatingRef.current) { touchStartRef.current = null; touchEndRef.current = null; return; }
    if (horizontal && Math.abs(dx) > min) {
      if (dx > 0) goRight(); else goLeft();
    } else if (!horizontal && Math.abs(dy) > min) {
      if (dy > 0) goUp(); else goDown();
    }
    touchStartRef.current = null; touchEndRef.current = null;
  };

  // Навигация стрелками на клавиатуре (ПК)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e as any).isComposing) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') goLeft();
      if (e.key === 'ArrowRight') goRight();
      if (e.key === 'ArrowUp') goUp();
      if (e.key === 'ArrowDown') goDown();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goLeft, goRight, goUp, goDown]);

  // Действия из экрана выбора: вверх/вниз
  useEffect(() => {
    if (navigatingRef.current) return;
    if (position.x === 1 && position.y === -1) {
      // Вверх из экрана выбора → ИИ Оценка (только для админов)
      if (isMaster(userId)) {
        setCurrentStep('evaluation-mode');
        try { sessionStorage.setItem('homePosition', 'choice'); } catch { }
        navigatingRef.current = true;
        router.push('/request/evaluation-mode');
      } else {
        // Возвращаемся на экран выбора и показываем заметку (остаёмся на (1,0))
        goTo(1, 0);
      }
    }
    if (position.x === 1 && position.y === 1) {
      // Вниз из экрана выбора → Ручная оценка
      try { sessionStorage.setItem('homePosition', 'choice'); } catch { }
      navigatingRef.current = true;
      router.push('/request/device-info');
    }
  }, [position.x, position.y, router, setCurrentStep, userId, goTo]);

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
  // Редирект произойдет только если после всех проверок точно не в Telegram
  if (isInTelegram === false && !isLoading) {
    // Дополнительная проверка перед редиректом
    const finalCheck = typeof window !== 'undefined' && (
      !!(window as any).Telegram?.WebApp ||
      !!(window as any).TelegramWebviewProxy ||
      document.cookie.split('; ').some(row => row.startsWith('_initData='))
    );

    if (!finalCheck) {
      router.push('/telegram');
      return null;
    }
  }

  return (
    <AdaptiveContainer>
      <div className={`${isDesktopLike ? 'flex justify-center' : ''}`}>
        <div className="w-full max-w-[420px]">
          <div className={`${isDesktopLike ? 'max-h-[900px] overflow-auto' : ''}`}>
            <div
              className={`w-full ${isDesktopLike ? 'max-w-[520px]' : 'max-w-[480px]'} mx-auto min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-2 box-border`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Панель с секциями */}
              <motion.div
                className="absolute inset-0"
                animate={{ x: `${position.x * -100}%`, y: `${position.y * -100}%` }}
                transition={{
                  duration: instantTransition ? 0 : 0.5, // Увеличена длительность для плавности
                  ease: [0.25, 0.46, 0.45, 0.94], // Более плавная кривая (iOS-style easing)
                  type: 'tween',
                  stiffness: 100,
                  damping: 20
                }}
                style={{
                  willChange: 'transform',
                  touchAction: 'pan-x pan-y'
                }}
              >
                {/* Центр: Главное меню */}
                <div className="absolute inset-0 p-4">
                  <div className="w-full text-center space-y-2 mt-6">
                    <div className={`flex flex-col ${adaptiveGap} ${adaptivePadding} w-full h-full`}>
                      <div className="w-full flex justify-center">
                        <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                      </div>
                      <div className="mt-6 text-gray-500 text-sm select-none">
                        Свайпните влево — Ремонт · вправо — Выбор · вверх — FAQ · вниз — Лента
                      </div>
                    </div>
                  </div>
                </div>

                {/* Низ: Лента отдельно */}
                <div className="absolute inset-0" style={{ transform: 'translateY(100%)' }}>
                  <div className="h-full grid place-items-center p-4">
                    <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-3">
                      <AdaptiveDeviceFeed
                        items={marketplaceItems}
                        isLoading={marketplaceLoading}
                        onLoadMore={loadMoreMarketplaceItems}
                        hasMore={marketplaceHasMore}
                        mode="auto"
                        onViewModeChange={handleViewModeChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Вверх: FAQ (заглушка) */}
                <div className="absolute inset-0 grid place-items-center" style={{ transform: 'translateY(-100%)' }}>
                  <div className="text-center p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">FAQ</h1>
                    <p className="text-gray-600 text-sm">Раздел в разработке</p>
                  </div>
                </div>

                {/* Влево: Ремонт (заглушка) */}
                <div className="absolute inset-0 grid place-items-center" style={{ transform: 'translateX(-100%)' }}>
                  <div className="text-center p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Ремонт</h1>
                    <p className="text-gray-600 text-sm">Страница появится позже</p>
                  </div>
                </div>

                {/* Вправо: Экран выбора */}
                <div className="absolute inset-0" style={{ transform: 'translateX(100%)' }}>
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Выбор</h1>
                    <p className="text-gray-600 mt-1">Свайп вверх — ИИ Оценка{!isMaster(userId) ? ' (для админов)' : ''}</p>
                    <p className="text-gray-600">Свайп вниз — Ручная оценка</p>
                    {!isMaster(userId) && (
                      <div className="mt-3 text-xs text-gray-500">ИИ оценка в разработке, доступно администраторам</div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Нижнее меню — в центре и в секции Лента */}
              {(position.x === 0 && (position.y === 0 || position.y === 1)) && (
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
              )}
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