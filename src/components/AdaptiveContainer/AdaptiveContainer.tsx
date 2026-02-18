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
    const wideMode = (isTelegram && safeArea.isDesktop && (isWidePage || isAdminPath)) || isAdminPath;

    if (wideMode) {
      html.classList.add('telegram-wide');
    } else {
      html.classList.remove('telegram-wide');
    }

    if (isAdminPath) {
      html.classList.add('is-admin');
    } else {
      html.classList.remove('is-admin');
    }

    return () => {
      html.classList.remove('telegram-wide', 'is-admin');
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



  const getContainerStyles = () => {
    // We remove all "frame" and "nested scroll" logic. 
    // The browser handles the scroll on the main document.
    return {
      container: 'w-full min-h-screen flex flex-col bg-white',
      main: 'w-full flex-1 flex flex-col',
      wrapper: 'w-full flex-1 flex flex-col',
      fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
    };
  };

  const styles = getContainerStyles();

  if (isTelegram && !isReady) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center">
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
        <main className={styles.main}>
          {children}
        </main>

        {fixedContent && (
          <div className={styles.fixedLayer}>
            {fixedContent}
          </div>
        )}
      </div>
    </div>
  );
}