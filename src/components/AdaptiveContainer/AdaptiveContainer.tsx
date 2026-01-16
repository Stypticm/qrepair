'use client';

import { useEffect, useState } from 'react';
// Убрали импорт SDK методов для свайпов - используем прямой доступ к Telegram WebApp API
import Image from 'next/image';
import { useSafeArea } from '@/hooks/useSafeArea';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, className = '' }: AdaptiveContainerProps) {
  const safeArea = useSafeArea();
  const { isTelegram, isReady, safeAreaInsets, isFullscreen } = safeArea;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const desktop = !mobile && (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux'));

      safeArea.getState().setIsMobile(mobile);
      safeArea.getState().setIsDesktop(desktop);
    };

    checkDevice();
  }, [isMounted, safeArea]);

  // Управление свайпами в зависимости от платформы
  useEffect(() => {
    if (!isMounted) return;
    if (!safeArea.isTelegram) return;
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
      
      const apply = () => {
        try {
          if (isMobilePlatform) {
            // На мобильных - отключаем только свайп вниз для закрытия приложения
            if (typeof wa?.disableVerticalSwipes === 'function') {
              wa.disableVerticalSwipes();
            }
          } else if (isDesktopPlatform) {
            // На десктопе - ВКЛЮЧАЕМ свайпы для работы на тачпаде
            if (typeof wa?.enableVerticalSwipes === 'function') {
              wa.enableVerticalSwipes();
            }
          }
        } catch {}
      };
      apply();
      const t1 = setTimeout(apply, 300);
      const t2 = setTimeout(apply, 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        // Восстанавливаем свайпы при размонтировании
        try {
          if (typeof wa?.enableVerticalSwipes === 'function') {
            wa.enableVerticalSwipes();
          }
        } catch {}
      };
    } catch {}
  }, [isMounted, safeArea.isTelegram]);

  if (!isMounted) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <Image
          src="/animation_running.gif"
          alt="Загрузка"
          width={192}
          height={192}
          className="object-contain rounded-2xl"
        />
      </div>
    );
  }

  const getContainerStyles = () => {
    const { isMobile, isDesktop } = safeArea;
    if (!isTelegram) {
      if (isDesktop) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'w-[390px] h-[844px] overflow-hidden',
          wrapper: 'w-[390px] h-[844px] mx-auto',
        };
      } else if (isMobile) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'flex-1 h-full w-full max-w-md mx-auto bg-white rounded-2xl',
          wrapper: 'w-full h-full max-w-md mx-auto',
        };
      }
    }

    if (isDesktop) {
      return {
        container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
        main: 'w-[390px] h-[844px] overflow-hidden my-auto-center',
        wrapper: 'w-[390px] h-[844px] mx-auto p-0',
      };
    } else {
      // Для десктопа - НЕ добавляем telegram-fullscreen класс
      // Проверяем платформу
      const isDesktop = typeof window !== 'undefined' && 
        (window as any).Telegram?.WebApp?.platform &&
        !['android', 'ios'].includes((window as any).Telegram?.WebApp?.platform);
      
      return {
        container: `min-h-dvh w-full flex flex-col bg-white ${isDesktop ? '' : 'telegram-fullscreen'}`,
        main: 'flex-1 w-full',
        wrapper: 'w-full',
      };
    }
  };

  const styles = getContainerStyles();

  if (isTelegram && !isReady) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <Image
          src="/animation_running.gif"
          alt="Загрузка"
          width={192}
          height={192}
          className="object-contain rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-[#2dc2c6] text-white text-xs p-2 z-50 rounded-br">
          <div>Mode: {isTelegram ? 'Telegram' : 'Browser'}</div>
          <div>Device: {safeArea.isMobile ? 'Mobile' : safeArea.isDesktop ? 'Desktop' : 'Unknown'}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</div>
        </div>
      )} */}

      <div className={styles.wrapper}>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}