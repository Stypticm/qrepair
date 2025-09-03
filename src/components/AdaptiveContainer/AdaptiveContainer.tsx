'use client';

import { useEffect, useState } from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, className = '' }: AdaptiveContainerProps) {
  const { isTelegram, isReady, safeAreaInsets, isFullscreen, forceFullscreen } = useSafeArea();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuButton, setIsMenuButton] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Определяем тип устройства
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const desktop = !mobile && (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux'));

      setIsMobile(mobile);
      setIsDesktop(desktop);

      console.log('Device detection:', { mobile, desktop, userAgent });
    };

    checkDevice();

    // Проверяем, открыто ли приложение через Menu Button
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      const isMenuButtonContext = !webApp.initDataUnsafe?.start_param;
      setIsMenuButton(isMenuButtonContext);
      console.log('App opened via Menu Button:', isMenuButtonContext, 'Start param:', webApp.initDataUnsafe?.start_param);

      // Принудительно запрашиваем fullscreen для всех контекстов, если не в fullscreen
      if (!isFullscreen) {
        console.log('Not in fullscreen, forcing fullscreen at', new Date().toISOString());
        forceFullscreen();
      }
    }
  }, [isMounted, isFullscreen, forceFullscreen]);

  // Не рендерим ничего до монтирования
  if (!isMounted) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
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

  // Определяем стили в зависимости от контекста
  const getContainerStyles = () => {
    if (!isTelegram) {
      // Браузерный режим (ПК или мобильный)
      if (isDesktop) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-gradient-to-b from-white to-gray-50 items-center justify-center',
          main: 'flex-1 w-full max-w-md shadow-lg bg-white rounded-2xl',
          wrapper: 'w-full max-w-md mx-auto',
        };
      } else if (isMobile) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-gradient-to-b from-white to-gray-50 items-center justify-center',
          main: 'flex-1 h-full w-full max-w-md mx-auto shadow-lg bg-white rounded-2xl',
          wrapper: 'w-full h-full max-w-md mx-auto',
        };
      }
    }

    // Telegram режим - используем полный экран
    return {
      container: `min-h-dvh w-full flex flex-col bg-gradient-to-b from-white to-gray-50 telegram-fullscreen`,
      main: 'flex-1 w-full p-4',
      wrapper: 'w-full',
    };
  };

  const styles = getContainerStyles();

  // Показываем загрузку только для Telegram
  if (isTelegram && !isReady) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2dc2c6] mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram WebApp...</p>
          <p className="text-sm text-gray-500 mt-2">
            {isMobile ? 'Мобильное устройство' : isDesktop ? 'Десктоп' : 'Неизвестно'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Fullscreen: {isFullscreen ? 'Да' : 'Нет'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Menu Button: {isMenuButton ? 'Да' : 'Нет'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-[#2dc2c6] text-white text-xs p-2 z-50 rounded-br">
          <div>Mode: {isTelegram ? 'Telegram' : 'Browser'}</div>
          <div>Device: {isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Unknown'}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Дополнительный отступ сверху для Telegram */}
      {isTelegram && (
        <div
          className="w-full bg-transparent"
          style={{
            height: `${Math.max(safeAreaInsets.top, 20)}px`,
            minHeight: '20px',
          }}
        />
      )}

      <div className={styles.wrapper}>{children}</div>
    </div>
  );
}