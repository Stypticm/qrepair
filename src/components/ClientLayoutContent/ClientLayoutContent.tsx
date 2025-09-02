'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { init } from '@telegram-apps/sdk';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { TelegramFullScreen } from '../TelegramFullScreen';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  useEffect(() => {
    // Инициализируем Telegram SDK
    init();
  }, []);

  return (
    <TelegramFullScreen>
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </TelegramFullScreen>
  );
}
