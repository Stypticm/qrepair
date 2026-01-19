'use client';

import type { PropsWithChildren } from 'react';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { useRequestSync } from '@/hooks/useRequestSync';
import { useTelegramDisableVerticalSwipes } from '@/app/telegram/telegram-web-view/useTelegramDisableVerticalSwipes';

export function ClientLayoutContent({ children }: PropsWithChildren) {

  // Запускаем синхронизацию состояния заявки
  useRequestSync();
  useTelegramDisableVerticalSwipes();  

  return (
    <div id="app-root">
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </div>
  );
}
