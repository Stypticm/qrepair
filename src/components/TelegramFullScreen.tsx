'use client';

import { useEffect, useState } from 'react';

interface TelegramFullScreenProps {
  children: React.ReactNode;
}

export function TelegramFullScreen({ children }: TelegramFullScreenProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuButton, setIsMenuButton] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      // Проверяем, открыто ли через Menu Button
      const isMenuButtonContext = !webApp.initDataUnsafe?.start_param;
      setIsMenuButton(isMenuButtonContext);

      // Принудительное расширение
      const expand = () => {
        console.log(isMenuButtonContext ? 'Menu Button: Forcing full screen...' : 'Forcing full screen...');
        webApp.expand();

        // Повторные попытки, если не развернуто
        [100, 300].forEach((delay) => {
          setTimeout(() => {
            if (!webApp.isExpanded) {
              console.log(`Expand attempt at ${delay}ms`);
              webApp.expand();
            }
          }, delay);
        });
      };

      expand();

      // Обработчик изменений viewport
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          console.log('Viewport changed:', event);
          setIsExpanded(event.is_expanded || false);

          // Если не развернуто, пытаемся снова
          if (!event.is_expanded) {
            console.log('Viewport not expanded, retrying...');
            webApp.expand();
          }
        });
      }

      // Очистка
      return () => {
        if (webApp.offViewportChanged) webApp.offViewportChanged(() => { });
      };
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