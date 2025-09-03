'use client';

import { useEffect, useState } from 'react';
import { miniApp, expandViewport, viewport } from '@telegram-apps/sdk';

interface TelegramFullScreenProps {
  children: React.ReactNode;
}

export function TelegramFullScreen({ children }: TelegramFullScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && miniApp && miniApp.isSupported()) {
      // Принудительное fullscreen
      const requestFull = () => {
        try {
          // Используем requestFullscreen согласно документации
          if (viewport.requestFullscreen) {
            viewport.requestFullscreen();
          } else {
            viewport.expand();
          }
        } catch (error) {
          // Fallback к expand
          try {
            viewport.expand();
          } catch (e) {
            // Если и expand не работает, используем expandViewport
            expandViewport();
          }
        }
      };

      // Немедленно запрашиваем fullscreen
      requestFull();

      // Повторные попытки через небольшие интервалы
      const retryIntervals = [100, 300, 500];
      retryIntervals.forEach((delay) => {
        setTimeout(() => {
          requestFull();
        }, delay);
      });
    }
  }, []);

  return (
    <div
      className="w-full h-dvh"
      style={{
        minHeight: '100dvh',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  );
}