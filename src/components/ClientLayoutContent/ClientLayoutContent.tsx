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
        // Дополнительно попробуем полноэкранный режим и expand
        try {
          const wa: any = window.Telegram?.WebApp;
          if (wa?.isVersionAtLeast?.('8.0')) {
            wa.requestFullscreen?.();
          }
          wa?.expand?.();
          wa.headerColor = '#2dc2c6';
          wa.backgroundColor = '#ffffff';
          wa.ready?.();
        } catch {}
        // Глобально ограничиваем вертикальные свайпы (можно отключать точечно на страницах)
        const manager = swipeBehavior;
        let restore: (() => void) | undefined;
        // Mount per docs (v3 uses direct methods on variable)
        try { manager?.mount?.(); } catch {}
        try {
          manager?.disableVertical?.();
          restore = () => {
            try { manager?.enableVertical?.(); } catch {}
            try { manager?.unmount?.(); } catch {}
          };
        } catch {}

        // Мягкий UI-фоллбек на уровне приложения
        const prevTouchAction = document.body.style.touchAction;
        const prevOverscrollY = (document.body.style as any).overscrollBehaviorY;
        const prevHtmlOverscrollY = (document.documentElement.style as any).overscrollBehaviorY;
        document.body.style.touchAction = 'pan-x';
        (document.body.style as any).overscrollBehaviorY = 'contain';
        (document.documentElement.style as any).overscrollBehaviorY = 'contain';

        return () => {
          try { restore?.(); } catch {}
          document.body.style.touchAction = prevTouchAction;
          (document.body.style as any).overscrollBehaviorY = prevOverscrollY;
          (document.documentElement.style as any).overscrollBehaviorY = prevHtmlOverscrollY;
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
