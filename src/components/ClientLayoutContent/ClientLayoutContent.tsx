'use client';

import type { PropsWithChildren } from 'react';
import { AdaptiveContainer } from '../AdaptiveContainer';
import { TelegramFullScreen } from '../TelegramFullScreen';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  return (
    <TelegramFullScreen>
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </TelegramFullScreen>
  );
}
