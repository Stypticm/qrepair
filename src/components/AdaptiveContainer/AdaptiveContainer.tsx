'use client';

import { useEffect, useState } from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, className = '' }: AdaptiveContainerProps) {
  const { isTelegram, isReady, safeAreaInsets, isExpanded } = useSafeArea();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
  }, [isMounted]);

  // Не рендерим ничего до монтирования
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
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
      // Браузер режим (PC или мобильный)
      if (isDesktop) {
        // Desktop - центрируем и ограничиваем размер
        return {
          container: "min-h-screen min-w-screen flex flex-col bg-gradient-to-b from-white to-gray-50 items-center justify-center",
          main: "flex-1 w-full max-w-md shadow-lg bg-white rounded-2xl",
          wrapper: "w-full max-w-md mx-auto"
        };
      } else if (isMobile) {
        // Mobile браузер - фиксированный размер как раньше
        return {
          container: "min-h-screen min-w-screen flex flex-col bg-gradient-to-b from-white to-gray-50 items-center justify-center",
          main: "flex-1 h-full w-full max-w-md mx-auto shadow-lg bg-white rounded-2xl",
          wrapper: "w-full h-full max-w-md mx-auto"
        };
      }
    }
    
    // Telegram режим - используем полный экран
    return {
      container: "min-h-screen w-full flex flex-col bg-gradient-to-b from-white to-gray-50",
      main: "flex-1 w-full p-4",
      wrapper: "w-full"
    };
  };

  const styles = getContainerStyles();

  // Показываем загрузку только для Telegram
  if (isTelegram && !isReady) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram WebApp...</p>
          <p className="text-sm text-gray-500 mt-2">
            {isMobile ? 'Мобильное устройство' : 'Десктоп'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Расширение: {isExpanded ? 'Да' : 'Нет'}
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
          <div>Expanded: {isExpanded ? 'Yes' : 'No'}</div>
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
        {children}
      </div>
    </div>
  );
}
