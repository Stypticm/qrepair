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
        
        // КРИТИЧЕСКИ ВАЖНО: Отключаем свайп вниз для закрытия ПЕРЕД ready()
        // Это должно быть сделано как можно раньше, чтобы предотвратить сворачивание
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
        
        // На мобильных - отключаем свайп вниз для закрытия ПЕРЕД ready()
        // Это позволяет внутренним свайпам работать, но блокирует закрытие приложения
        if (isMobilePlatform) {
          try {
            if (typeof wa?.disableVerticalSwipes === 'function') {
              wa.disableVerticalSwipes();
              console.log('🔍 ClientLayoutContent - disableVerticalSwipes применён ДО ready() (мобильная платформа)');
            }
          } catch (error) {
            console.error('disableVerticalSwipes failed:', error);
          }
        }
        
        // Вызываем ready() - это уведомляет Telegram о готовности приложения
        try {
          wa.headerColor = '#2dc2c6';
          wa.backgroundColor = '#ffffff';
          wa.ready?.();
        } catch {}
        
        // После ready() - повторно применяем настройки свайпов для надежности
        if (isMobilePlatform) {
          try {
            if (typeof wa?.disableVerticalSwipes === 'function') {
              wa.disableVerticalSwipes();
              console.log('🔍 ClientLayoutContent - disableVerticalSwipes применён ПОСЛЕ ready() (мобильная платформа)');
            }
          } catch (error) {
            console.error('disableVerticalSwipes failed after ready:', error);
          }
        } else if (isDesktopPlatform) {
          // На десктопе - ВКЛЮЧАЕМ свайпы для работы на тачпаде
          try {
            if (typeof wa?.enableVerticalSwipes === 'function') {
              wa.enableVerticalSwipes();
              console.log('🔍 ClientLayoutContent - enableVerticalSwipes применён (десктоп платформа)');
            }
          } catch (error) {
            console.error('enableVerticalSwipes failed:', error);
          }
        }
        
        // Дополнительно попробуем полноэкранный режим и expand (только для мобильных)
        try {
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
        } catch {}
        
        // Защита от свайпа вниз в начале страницы (scrollY === 0)
        // Когда пользователь в начале страницы, свайп вниз может восприниматься как жест на сворачивание
        let handleTouchStart: ((e: TouchEvent) => void) | null = null;
        if (isMobilePlatform) {
          const preventCollapseOnTopSwipe = () => {
            // Если мы в начале страницы, немного прокручиваем вниз
            if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
              window.scrollTo({ top: 1, behavior: 'instant' });
            }
          };
          
          // Проверяем при загрузке
          setTimeout(preventCollapseOnTopSwipe, 100);
          
          // Перехватываем touchstart в начале страницы
          handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
              // Небольшая прокрутка вниз, чтобы предотвратить сворачивание
              window.scrollTo({ top: 1, behavior: 'instant' });
            }
          };
          
          document.addEventListener('touchstart', handleTouchStart, { passive: true });
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
          
          // Удаляем обработчик touchstart для защиты от сворачивания
          if (handleTouchStart) {
            document.removeEventListener('touchstart', handleTouchStart);
          }
          
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
