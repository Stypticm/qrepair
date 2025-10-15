'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { init, swipeBehavior } from '@telegram-apps/sdk';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { TelegramFullScreen } from '../TelegramFullScreen';
import { useAppStore } from '@/stores/authStore';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  const { initializeTelegram } = useAppStore();

  useEffect(() => {
    // Инициализируем Telegram SDK только если мы в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        init();
        console.log('🔍 ClientLayoutContent - Telegram SDK initialized');
        // Глобально ограничиваем вертикальные свайпы (можно отключать точечно на страницах)
        const manager = swipeBehavior;
        let restore: (() => void) | undefined;
        if (manager?.isSupported?.()) {
          manager.disableVertical?.();
          restore = () => manager.enableVertical?.();
        }

        // Мягкий UI-фоллбек на уровне приложения
        const prevTouchAction = document.body.style.touchAction;
        const prevOverscrollY = (document.body.style as any).overscrollBehaviorY;
        document.body.style.touchAction = 'pan-x';
        (document.body.style as any).overscrollBehaviorY = 'contain';

        return () => {
          try { restore?.(); } catch {}
          document.body.style.touchAction = prevTouchAction;
          (document.body.style as any).overscrollBehaviorY = prevOverscrollY;
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
