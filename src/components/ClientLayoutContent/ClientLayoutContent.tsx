'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { init, swipeBehavior } from '@telegram-apps/sdk';
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
            wa?.expand?.();
            manager?.disableVertical?.();
          } catch {}
        };
        const onVisibility = () => { if (document.visibilityState === 'visible') rearm(); };
        window.addEventListener('focus', rearm, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('resize', rearm, { passive: true });

        return () => {
          try { restore?.(); } catch {}
          document.body.style.overflow = prevOverflow;
          document.body.style.height = prevHeight;
          window.removeEventListener('focus', rearm as any);
          document.removeEventListener('visibilitychange', onVisibility as any);
          window.removeEventListener('resize', rearm as any);
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
