'use client';

import { useEffect, useState } from 'react';
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

  if (!isMounted) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getContainerStyles = () => {
    const { isMobile, isDesktop } = safeArea;
    if (!isTelegram) {
      if (isDesktop) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'w-[390px] h-[844px] overflow-hidden bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.10)]',
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
        main: 'w-[390px] h-[844px] overflow-hidden bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.10)]',
        wrapper: 'w-[390px] h-[844px] mx-auto p-0',
      };
    } else {
      return {
        container: `min-h-dvh w-full flex flex-col bg-white telegram-fullscreen`,
        main: 'flex-1 w-full',
        wrapper: 'w-full',
      };
    }
  };

  const styles = getContainerStyles();

  if (isTelegram && !isReady) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2dc2c6] mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram WebApp...</p>
          <p className="text-sm text-gray-500 mt-2">
            {safeArea.isMobile ? 'Мобильное устройство' : safeArea.isDesktop ? 'Десктоп' : 'Неизвестно'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Fullscreen: {isFullscreen ? 'Да' : 'Нет'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-[#2dc2c6] text-white text-xs p-2 z-50 rounded-br">
          <div>Mode: {isTelegram ? 'Telegram' : 'Browser'}</div>
          <div>Device: {safeArea.isMobile ? 'Mobile' : safeArea.isDesktop ? 'Desktop' : 'Unknown'}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</div>
        </div>
      )}

      <div className={styles.wrapper}>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}