'use client';

import { useEffect, useState } from 'react';

interface TelegramFullScreenProps {
  children: React.ReactNode;
}

export function TelegramFullScreen({ children }: TelegramFullScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuButton, setIsMenuButton] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      // Проверяем контекст Menu Button
      const isMenuButtonContext = !webApp.initDataUnsafe?.start_param;
      setIsMenuButton(isMenuButtonContext);

      // Принудительное fullscreen
      const requestFull = () => {
        console.log(isMenuButtonContext ? 'Menu Button: Requesting fullscreen...' : 'Requesting fullscreen...');
        if ('requestFullscreen' in webApp && typeof webApp.requestFullscreen === 'function') {
          webApp.requestFullscreen();
        } else {
          console.log('requestFullscreen not available, falling back to expand...');
          webApp.expand();
        }

        // Повторные попытки
        [100, 300].forEach((delay) => {
          setTimeout(() => {
            const isCurrentlyFullscreen = 'isFullscreen' in webApp ? webApp.isFullscreen : webApp.isExpanded;
            if (!isCurrentlyFullscreen) {
              console.log(`Fullscreen attempt at ${delay}ms`);
              if ('requestFullscreen' in webApp && typeof webApp.requestFullscreen === 'function') {
                webApp.requestFullscreen();
              } else {
                webApp.expand();
              }
            }
          }, delay);
        });
      };

      requestFull();

      // Обработчик изменений viewport (для совместимости)
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          console.log('Viewport changed:', event);
          setIsFullscreen(event.is_expanded || false);

          if (!event.is_expanded) {
            console.log('Viewport not in fullscreen, retrying...');
            requestFull();
          }
        });
      }

      // Обработчик событий fullscreen
      if (webApp.onEvent) {
        const fullscreenChangedHandler = (event: { isFullscreen: boolean }) => {
          console.log('Fullscreen changed:', event);
          setIsFullscreen(event.isFullscreen);
          if (!event.isFullscreen) {
            requestFull();
          }
        };

        const fullscreenFailedHandler = (error: any) => {
          console.error('Fullscreen request failed:', error);
          webApp.expand(); // Fallback
        };

        webApp.onEvent('fullscreenChanged', fullscreenChangedHandler);
        webApp.onEvent('fullscreenFailed', fullscreenFailedHandler);

        // Очистка
        return () => {
          if (webApp.offEvent) {
            webApp.offEvent('fullscreenChanged', fullscreenChangedHandler);
            webApp.offEvent('fullscreenFailed', fullscreenFailedHandler);
          }
          if (webApp.offViewportChanged) {
            webApp.offViewportChanged(() => { });
          }
        };
      }
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