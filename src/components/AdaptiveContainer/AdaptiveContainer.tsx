'use client';

import { useEffect, useState } from 'react';
// Убрали импорт SDK методов для свайпов - используем прямой доступ к Telegram WebApp API
import Image from 'next/image';
import { useSafeArea } from '@/hooks/useSafeArea';
import { usePathname } from 'next/navigation';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  fixedContent?: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, fixedContent, className = '' }: AdaptiveContainerProps) {
  const safeArea = useSafeArea();
  const { isTelegram, isReady, safeAreaInsets, isFullscreen } = safeArea;
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');
  const isWidePage = pathname === '/' || pathname?.startsWith('/catalog') || pathname?.startsWith('/about') || pathname?.includes('/cart') || pathname?.includes('/favorites') || pathname?.includes('/buyback') || pathname?.includes('/repair') || pathname?.startsWith('/request');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const desktop = !mobile && (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux'));

      safeArea.getState()?.setIsMobile(mobile);
      safeArea.getState()?.setIsDesktop(desktop);
    };

    checkDevice();
  }, [isMounted, safeArea]);

  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;
    // Включаем широкий режим только для Desktop в Telegram
    if (isTelegram && safeArea.isDesktop && (isWidePage || isAdminPath)) {
      html.classList.add('telegram-wide');
    } else {
      html.classList.remove('telegram-wide');
    }

    return () => {
      html.classList.remove('telegram-wide');
    };
  }, [isMounted, isTelegram, safeArea.isDesktop, isWidePage, isAdminPath]);

  // Управление свайпами в зависимости от платформы
  useEffect(() => {
    if (!isMounted) return;
    if (!safeArea.isTelegram) return;
    // Важно: управление свайпами централизовано в `useTelegramDisableVerticalSwipes()`.
    // Дублирующие enable/disable + ретраи на мобильных часто вызывают дерганье скролла/viewport.
    return;
  }, [isMounted, safeArea.isTelegram]);

  if (!isMounted) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <img
          src="/coconut-dancing.gif"
          alt="Загрузка"
          className="w-32 h-32 object-contain"
        />
      </div>
    );
  }

  const getContainerStyles = () => {
    const { isMobile, isDesktop } = safeArea;
    if (!isTelegram) {
      if (isDesktop) {
        if (isWidePage || isAdminPath) {
          return {
            container: 'min-h-dvh w-full flex flex-col bg-gray-50/50',
            main: 'w-full flex-1 overflow-x-hidden overflow-y-auto relative',
            wrapper: 'w-full flex-1 relative',
            fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
          };
        }
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'w-[390px] h-[844px] overflow-x-hidden overflow-y-auto relative border border-gray-100 shadow-2xl rounded-[32px] my-8',
          wrapper: 'w-[390px] h-[844px] mx-auto relative',
          fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
        };
      } else if (isMobile) {
        if (isWidePage || isAdminPath) {
          return {
            container: 'min-h-dvh w-full flex flex-col bg-white',
            main: 'flex-1 w-full overflow-y-auto overflow-x-hidden relative',
            wrapper: 'w-full flex-1 relative flex flex-col',
            fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
          };
        }
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white',
          main: 'flex-1 h-full w-full bg-white overflow-y-auto overflow-x-hidden relative',
          wrapper: 'w-full h-full relative flex flex-col',
          fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
        };
      }
    }

    if (isDesktop) {
      if (isWidePage || isAdminPath) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-transparent',
          main: 'w-full flex-1 relative', // Убираем внутренний overflow, полагаемся на скролл страницы
          wrapper: 'w-full flex-1 relative flex flex-col',
          fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
        };
      }
      return {
        // В Telegram Desktop заполняем весь webview, без внутренних рамок и фоновых полей
        container: 'w-full h-full flex flex-col bg-transparent',
        main: 'w-full h-full overflow-y-auto relative', // Разрешаем скролл
        wrapper: 'w-full h-full relative flex flex-col',
        fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
      };
    }
    else {
      // Проверяем платформу для мобильных устройств
      const isTGWorkerMobile = typeof window !== 'undefined' &&
        (window as any).Telegram?.WebApp?.platform &&
        ['android', 'ios'].includes((window as any).Telegram?.WebApp?.platform);

      return {
        container: `min-h-dvh w-full flex flex-col bg-white ${isTGWorkerMobile ? 'telegram-fullscreen' : ''}`,
        main: 'flex-1 w-full overflow-y-auto overflow-x-hidden suppress-overscroll relative', // Добавили класс для подавления оверскролла
        wrapper: 'w-full h-full flex flex-col relative',
        fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
      };
    }
  };

  const styles = getContainerStyles();

  if (isTelegram && !isReady) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <img
          src="/coconut-dancing.gif"
          alt="Загрузка"
          className="w-32 h-32 object-contain"
        />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Загрузка интерфейса...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          {children}
        </div>

        {fixedContent && (
          <div className={styles.fixedLayer}>
            {fixedContent}
          </div>
        )}
      </div>
    </div>
  );
}