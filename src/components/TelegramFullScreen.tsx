'use client';

import { useEffect, useState, useRef } from 'react';
import { miniApp, viewport } from '@telegram-apps/sdk';

interface TelegramFullScreenProps {
  children: React.ReactNode;
}

export function TelegramFullScreen({ children }: TelegramFullScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const webApp = (window as any).Telegram?.WebApp;
    // Глобальный гард: fullscreen/expand пытаемся применить только один раз за сессию.
    // Иначе при навигации/перемонтировании возникают циклы viewport-resize → дерганье свайпов на мобиле.
    const g = window as any;
    if (g.__qoqos_tg_fullscreen_init) {
      return;
    }
    g.__qoqos_tg_fullscreen_init = true;

    // Добавляем класс на html только для мобильных платформ
    // На десктопе НЕ добавляем telegram-fullscreen, чтобы сохранить компактный режим
    try {
      const platform = webApp?.platform;
      const isMobile = platform === 'android' || platform === 'ios';
      if (isMobile) {
        document.documentElement.classList.add('telegram-fullscreen');
      }
    } catch {}

    const tryTelegramFullscreen = () => {
      try {
        if (!webApp) return false;

        // Сообщаем Telegram, что WebApp готов
        try { webApp.ready?.(); } catch {}

        const platform = webApp.platform;
        const isMobile = platform === 'android' || platform === 'ios';
        if (!isMobile) return false;

        if (webApp.isVersionAtLeast?.('8.0') && typeof webApp.requestFullscreen === 'function') {
          webApp.requestFullscreen();
          setIsFullscreen(true);
          return true;
        }

        if (typeof webApp.expand === 'function') {
          webApp.expand();
          setIsFullscreen(true);
          return true;
        }

        return false;
      } catch (e) {
        console.warn('Telegram fullscreen attempt failed:', e);
        return false;
      }
    };

    const trySdkViewport = () => {
      try {
        if (!(miniApp && miniApp.isSupported())) return false;
        if (viewport.requestFullscreen) {
          viewport.requestFullscreen();
          setIsFullscreen(true);
          return true;
        }
        if (viewport.expand) {
          viewport.expand();
          setIsFullscreen(true);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('SDK viewport fullscreen attempt failed:', e);
        return false;
      }
    };

    const attempt = () => {
      if (isRequesting) return false;
      setIsRequesting(true);
      
      // Очищаем предыдущий таймаут
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      const result = tryTelegramFullscreen() || trySdkViewport();
      
      // Увеличиваем время блокировки до 500ms для предотвращения спама
      requestTimeoutRef.current = setTimeout(() => {
        setIsRequesting(false);
      }, 500);
      
      return result;
    };

    // Первая попытка и несколько повторов
    attempt();
    // Минимальные ретраи: лишние expand/requestFullscreen на iOS Telegram дают "дёрганье".
    const retryIntervals = [200, 700];
    retryIntervals.forEach((delay) => {
      setTimeout(() => {
        if (!isFullscreen) attempt();
      }, delay);
    });

    // Cleanup функция
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []); // Убираем зависимости чтобы избежать бесконечного цикла

  // Определяем платформу для условных стилей
  const isDesktop = typeof window !== 'undefined' && 
    (window as any).Telegram?.WebApp?.platform &&
    !['android', 'ios'].includes((window as any).Telegram?.WebApp?.platform);

  return (
    <div
      className="w-full min-h-dvh bg-white"
      style={{
        minHeight: isDesktop ? 'auto' : '100dvh',
        width: isDesktop ? '100%' : '100vw',
        maxWidth: isDesktop ? '480px' : '100vw',
        overflowX: 'hidden',
        backgroundColor: '#ffffff',
        ...(isDesktop && {
          margin: '0 auto',
          borderRadius: '32px',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.2)',
          maxHeight: '844px',
        }),
      }}
    >
      {children}
    </div>
  );
}