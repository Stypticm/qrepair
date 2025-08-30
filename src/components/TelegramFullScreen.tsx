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
      if (webApp.initDataUnsafe?.start_param) {
        setIsMenuButton(true);
        console.log('🔍 Menu Button detected, forcing full screen...');
      }

      // Агрессивное расширение для Menu Button
      const expandForMenuButton = () => {
        if (isMenuButton) {
          console.log('🚀 Menu Button: Force expanding...');
          webApp.expand();
          
          // Множественные попытки расширения
          [100, 300, 500, 800, 1200, 2000].forEach(delay => {
            setTimeout(() => {
              if (!webApp.isExpanded) {
                console.log(`🔄 Menu Button: Expand attempt at ${delay}ms`);
                webApp.expand();
              }
            }, delay);
          });
        }
      };

      // Запускаем расширение
      expandForMenuButton();

      // Обработчик изменений viewport
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          console.log('📱 Viewport changed:', event);
          setIsExpanded(event.is_expanded || false);

          // Если не развернуто и это Menu Button, пытаемся снова
          if (isMenuButton && !event.is_expanded) {
            console.log('🔄 Menu Button: Viewport not expanded, retrying...');
            setTimeout(() => webApp.expand(), 100);
            setTimeout(() => webApp.expand(), 300);
            setTimeout(() => webApp.expand(), 600);
          }
        });
      }

      // Обработчик события открытия
      if (webApp.onEvent) {
        webApp.onEvent('app_opened', () => {
          console.log('🚀 App opened event - expanding...');
          webApp.expand();
        });
      }
    }
  }, [isMenuButton]);

  return (
    <div 
      className={`w-full ${
        isMenuButton 
          ? 'telegram-menu-button telegram-expanded min-h-dvh' 
          : 'telegram-fullscreen'
      }`}
      style={{
        minHeight: isMenuButton ? '100dvh' : 'auto',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      {children}
    </div>
  );
}
