'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { init } from '@telegram-apps/sdk';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { TelegramFullScreen } from '../TelegramFullScreen';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  useEffect(() => {
    // Инициализируем Telegram SDK только если мы в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        init();
      } catch (error) {
        console.log('Telegram SDK init error (ignored):', error);
      }
    }
  }, []);

  return (
    <TelegramFullScreen>
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </TelegramFullScreen>
  );
}
