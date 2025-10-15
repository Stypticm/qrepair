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
  const [testAdminIndex, setTestAdminIndex] = useState(0);
  const router = useRouter();
  const { forceFullscreen, isFullscreen } = useSafeArea();
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
        initializeTelegram(initDataState);
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
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-white to-gray-50 pt-8 box-border">
        <div className=" w-full max-w-md mx-auto text-center space-y-4 mt-16">
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 12, duration: 2.2 }}
            className="w-full"
          >
            <Image
              src={getPictureUrl('animation_logo2.gif') || '/animation_logo2.gif'}
              alt="Логотип"
              width={400}
              height={150}
              className="w-full max-w-md h-auto object-contain mx-auto rounded-2xl shadow-lg"
              priority
            />
          </motion.div>

          <div className="flex flex-col gap-4 w-full">
            <Button
              variant="outline"
              className="w-full h-14 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleStartForm}
            >
              Оценить смартфон
            </Button>
            <MarketplaceFeed />
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
                  Мои устройства
                </MenubarItem>
              </MenubarContent>
            </Menubar>
          </div>
        </div>
      </div >
    </AdaptiveContainer >
  );
}

export default function Home() {
  return <HomeContent />;
}

function MarketplaceFeed() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);

  const items = useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
    id: i + 1,
    title: `iPhone ${i + 8}`,
    price: `${(49990 + i * 1000).toLocaleString('ru-RU')} ₽`,
    image: '/logo3.png',
    isNew: i % 4 === 0,
    hasDiscount: i % 3 === 0,
  })), []);

  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || visibleCount >= items.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prevCount) => Math.min(prevCount + 6, items.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, visibleCount, items.length]);

  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < items.length) {
        loadMoreItems();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, loadMoreItems, visibleCount, items.length]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {visibleItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200
            shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)] transition hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_rgba(0,0,0,0.10)]"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/market/${item.id}`)}
            ref={index === visibleItems.length - 1 ? lastItemRef : null}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/market/${item.id}`);
              }
            }}
          >
            <div className="relative w-full h-20 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.title}
                width={160}
                height={80}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/wcAAgAB/epv2AAAAABJRU5ErkJggg=="
                className="object-contain w-full h-full p-3"
                priority={index < 6}
              />
            </div>
            <div className="p-2 text-left">
              <div className="text-[11px] font-semibold text-gray-900 tracking-[-0.01em] truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {item.price}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                {item.hasDiscount && (
                  <span className="inline-flex items-center px-1 h-4 rounded-full text-[8px] font-medium bg-red-50 text-red-700 border border-red-100">Скидка</span>
                )}
                {item.isNew && (
                  <span className="inline-flex items-center px-1 h-4 rounded-full text-[8px] font-medium bg-blue-50 text-blue-700 border border-blue-100">Новый</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {isLoadingMore && (
        <div className="flex justify-center items-center p-4">
          <span className="inline-flex items-center gap-2 text-gray-500">
            <Image
              src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
              alt="Загрузка"
              width={32}
              height={32}
              className="object-contain"
            />
            Загрузка...
          </span>
        </div>
      )}
    </div>
  );
}