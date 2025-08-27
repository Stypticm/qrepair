'use client';

import type { PropsWithChildren } from 'react';
import { AdaptiveContainer } from '../AdaptiveContainer';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  return <AdaptiveContainer>{children}</AdaptiveContainer>;
}
