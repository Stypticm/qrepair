'use client';

import { useEffect, useState } from 'react';
import { miniApp, viewport } from '@telegram-apps/sdk';

interface TelegramFullScreenProps {
  children: React.ReactNode;
}

export function TelegramFullScreen({ children }: TelegramFullScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && miniApp && miniApp.isSupported()) {
      const platform = window.Telegram?.WebApp?.platform;
      const isMobile = platform === 'android' || platform === 'ios';

      if (isMobile) {
        // Полноэкранный режим только для мобильных
        const requestFull = () => {
          try {
            if (viewport.requestFullscreen) {
              viewport.requestFullscreen();
              setIsFullscreen(true);
            } else {
              viewport.expand();
              setIsFullscreen(true);
            }
          } catch (error) {
            console.warn('Failed to request fullscreen:', error);
          }
        };

        requestFull();
        const retryIntervals = [100, 300, 500];
        retryIntervals.forEach((delay) => {
          setTimeout(() => {
            if (!isFullscreen) requestFull();
          }, delay);
        });
      }
    }
  }, [isFullscreen]);

  return (
    <div
      className="w-full min-h-dvh bg-white"
      style={{
        minHeight: '100dvh',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {children}
    </div>
  );
}