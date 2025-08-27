'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';
import { Comic_Neue } from 'next/font/google';
import { useSafeArea } from '@/hooks/useSafeArea';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import './globals.css';
import Header from '@/components/Header/Header';
import { StartFormProvider } from '@/components/StartFormContext/StartFormContext';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
});

function LayoutContent({ children }: PropsWithChildren) {
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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`${comicNeue.className} antialiased w-full flex flex-col overflow-hidden`} style={{ padding: 'env(--safe-area-top) env(--safe-area-right) env(--safe-area-bottom) env(--safe-area-left)' }}>
        <I18nProvider>
          <Root>
            <StartFormProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </StartFormProvider>
          </Root>
        </I18nProvider>
      </body>
    </html>
  );
}