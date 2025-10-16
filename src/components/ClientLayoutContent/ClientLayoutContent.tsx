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
        const prevOverflow = document.body.style.overflow;
        const prevHeight = document.body.style.height;
        document.body.style.touchAction = 'pan-x';
        (document.body.style as any).overscrollBehaviorY = 'contain';
        (document.documentElement.style as any).overscrollBehaviorY = 'contain';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100dvh';

        let startX: number | null = null;
        let startY: number | null = null;
        const onTouchStart = (e: TouchEvent) => {
          if (e.touches && e.touches.length > 0) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          }
        };
        const onTouchMove = (e: TouchEvent) => {
          if (startX == null || startY == null) return;
          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 16) {
            e.preventDefault();
          }
        };
        document.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });

        // Блокируем вертикальные колесо/трекпад скролл (оставляем горизонтальный)
        const onWheel = (e: WheelEvent) => {
          const absX = Math.abs(e.deltaX);
          const absY = Math.abs(e.deltaY);
          if (absY > absX && absY > 2) {
            e.preventDefault();
          }
        };
        document.addEventListener('wheel', onWheel, { passive: false });

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
          document.body.style.touchAction = prevTouchAction;
          (document.body.style as any).overscrollBehaviorY = prevOverscrollY;
          (document.documentElement.style as any).overscrollBehaviorY = prevHtmlOverscrollY;
          document.body.style.overflow = prevOverflow;
          document.body.style.height = prevHeight;
          document.removeEventListener('touchstart', onTouchStart as any);
          document.removeEventListener('touchmove', onTouchMove as any);
          document.removeEventListener('wheel', onWheel as any);
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
