'use client';

import { useEffect, useState } from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, className = '' }: AdaptiveContainerProps) {
  const { isTelegram, isReady, safeAreaInsets } = useSafeArea();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
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
  }, []);

  // Определяем стили в зависимости от контекста
  const getContainerStyles = () => {
    if (!isTelegram) {
      // Браузер режим
      if (isDesktop) {
        // Desktop - центрируем и ограничиваем размер как было раньше
        return {
          container: "min-h-screen w-full flex flex-col bg-[#f9ecb8] items-center justify-center",
          main: "flex-1 w-full max-w-md mx-auto p-6 shadow-lg bg-[#f9ecb8] rounded-lg my-8",
          wrapper: "w-full max-w-md mx-auto"
        };
      } else if (isMobile) {
        // Mobile браузер - полный экран
        return {
          container: "min-h-screen w-full flex flex-col bg-[#f9ecb8]",
          main: "flex-1 w-full p-4",
          wrapper: "w-full"
        };
      }
    }
    
    // Telegram режим - используем полный экран
    return {
      container: "min-h-screen w-full flex flex-col bg-[#f9ecb8]",
      main: "flex-1 w-full p-4",
      wrapper: "w-full"
    };
  };

  const styles = getContainerStyles();

  // Показываем загрузку только для Telegram
  if (isTelegram && !isReady) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram WebApp...</p>
          <p className="text-sm text-gray-500 mt-2">
            {isMobile ? 'Мобильное устройство' : 'Десктоп'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-green-500 text-white text-xs p-2 z-50 rounded-br">
          <div>Mode: {isTelegram ? 'Telegram' : 'Browser'}</div>
          <div>Device: {isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Unknown'}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      {/* Дополнительный отступ сверху для Telegram */}
      {isTelegram && (
        <div 
          className="w-full bg-transparent" 
          style={{ 
            height: `${Math.max(safeAreaInsets.top, 20)}px`,
            minHeight: '20px'
          }}
        />
      )}
      
      <div className={styles.wrapper}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
