'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

export function ClientLayoutContent({ children }: PropsWithChildren) {
  const { safeAreaInsets, isReady, cssVars } = useSafeArea();

  useEffect(() => {
    if (isReady && window.Telegram?.WebApp) {
      console.log('Layout - Safe Area Insets:', safeAreaInsets);
      console.log('Layout - Platform:', window.Telegram.WebApp.platform);
    }
  }, [safeAreaInsets, isReady]);

  if (!isReady) return null; // Предотвращаем рендер до готовности

  return (
    <div className="min-h-screen w-full flex flex-col" style={cssVars as React.CSSProperties}>
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-blue-500 text-white text-xs p-1 z-50">
          Layout: T:{safeAreaInsets.top} R:{safeAreaInsets.right} B:{safeAreaInsets.bottom} L:{safeAreaInsets.left}
        </div>
      )}
      <main
        className="flex-1 w-full max-w-full md:max-w-[800px] overflow-auto md:mx-auto md:my-4 md:max-h-[600px]"
      >
        {children}
      </main>
    </div>
  );
}
