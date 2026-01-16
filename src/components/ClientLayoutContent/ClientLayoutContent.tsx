'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { init } from '@telegram-apps/sdk';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { TelegramFullScreen } from '../TelegramFullScreen';
import { useAppStore } from '@/stores/authStore';
import { useRequestSync } from '@/hooks/useRequestSync';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  const { initializeTelegram } = useAppStore();
  
  // Запускаем синхронизацию состояния заявки
  useRequestSync();

  useEffect(() => {
    // Инициализируем Telegram SDK только если мы в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        init();
        console.log('🔍 ClientLayoutContent - Telegram SDK initialized');
        
        // Получаем WebApp объект один раз для использования во всех блоках
        const wa: any = window.Telegram?.WebApp;
        
        // Дополнительно попробуем полноэкранный режим и expand (только для мобильных)
        try {
          const platform = wa?.platform;
          const isMobilePlatform = platform === 'android' || platform === 'ios';
          
          // Для мобильных - fullscreen (на весь экран телефона)
          // Для десктопа - компактный режим (не вызываем expand/requestFullscreen)
          if (isMobilePlatform) {
            const supportsFullscreen = wa?.isVersionAtLeast?.('8.0') && 'requestFullscreen' in wa;
            
            // Вызываем expand() и requestFullscreen() сразу (без задержек)
            wa?.expand?.();
            
            if (supportsFullscreen) {
              try {
                wa.requestFullscreen?.();
              } catch (error) {
                console.error('requestFullscreen failed:', error);
              }
            }
          }
          
          wa.headerColor = '#2dc2c6';
          wa.backgroundColor = '#ffffff';
          wa.ready?.();
        } catch {}
        
        // Управление свайпами в зависимости от платформы
        try {
          const platform = wa?.platform;
          const isMobilePlatform = platform === 'android' || platform === 'ios';
          const isDesktopPlatform = !isMobilePlatform && (
            platform === 'tdesktop' || 
            platform === 'macos' || 
            platform === 'web' || 
            platform === 'weba' ||
            platform === 'windows' ||
            platform === 'linux'
          );
          
          if (isMobilePlatform) {
            // На мобильных - отключаем только свайп вниз для закрытия приложения
            // Внутренние свайпы должны работать
            if (typeof wa?.disableVerticalSwipes === 'function') {
              wa.disableVerticalSwipes();
              console.log('🔍 ClientLayoutContent - disableVerticalSwipes применён (мобильная платформа)');
            }
          } else if (isDesktopPlatform) {
            // На десктопе - ВКЛЮЧАЕМ свайпы для работы на тачпаде
            if (typeof wa?.enableVerticalSwipes === 'function') {
              wa.enableVerticalSwipes();
              console.log('🔍 ClientLayoutContent - enableVerticalSwipes применён (десктоп платформа)');
            }
          }
        } catch (error) {
          console.error('Swipe management failed:', error);
        }

        // Убираем глобальную блокировку скролла - пусть работает нормально
        // Только настраиваем базовые стили для Telegram WebApp
        const prevOverflow = document.body.style.overflow;
        const prevHeight = document.body.style.height;
        document.body.style.overflow = 'auto';
        document.body.style.height = '100dvh';

        // Переинициализация при смене видимости/фокуса/размера
        const rearm = () => {
          try {
            const wa: any = window.Telegram?.WebApp;
            const platform = wa?.platform;
            const isMobilePlatform = platform === 'android' || platform === 'ios';
            const isDesktopPlatform = !isMobilePlatform && (
              platform === 'tdesktop' || 
              platform === 'macos' || 
              platform === 'web' || 
              platform === 'weba' ||
              platform === 'windows' ||
              platform === 'linux'
            );
            
            // Для мобильных - expand, для десктопа - НЕ вызываем (компактный режим)
            if (isMobilePlatform) {
              wa?.expand?.();
              // На мобильных - отключаем свайп вниз для закрытия
              if (typeof wa?.disableVerticalSwipes === 'function') {
                wa.disableVerticalSwipes();
              }
            } else if (isDesktopPlatform) {
              // На десктопе - ВКЛЮЧАЕМ свайпы для тачпада
              if (typeof wa?.enableVerticalSwipes === 'function') {
                wa.enableVerticalSwipes();
              }
            }
          } catch {}
        };
        const onVisibility = () => { if (document.visibilityState === 'visible') rearm(); };
        window.addEventListener('focus', rearm, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('resize', rearm, { passive: true });

        return () => {
          document.body.style.overflow = prevOverflow;
          document.body.style.height = prevHeight;
          window.removeEventListener('focus', rearm as any);
          document.removeEventListener('visibilitychange', onVisibility as any);
          window.removeEventListener('resize', rearm as any);
          // Восстанавливаем свайпы при размонтировании
          try {
            const wa: any = window.Telegram?.WebApp;
            if (typeof wa?.enableVerticalSwipes === 'function') {
              wa.enableVerticalSwipes();
            }
          } catch {}
        };
      } catch (error) {
        console.error('❌ ClientLayoutContent - Error initializing Telegram SDK:', error);
      }
    }
    
    // Инициализируем данные пользователя
    console.log('🔍 ClientLayoutContent - initializing Telegram data...');
    initializeTelegram();
  }, [initializeTelegram]);

  return (
    <TelegramFullScreen>
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </TelegramFullScreen>
  );
}
