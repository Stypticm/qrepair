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
  const { safeAreaInsets } = useSafeArea();

  // Отладочная информация
  useEffect(() => {
    console.log('Layout - Safe Area Insets:', safeAreaInsets);
    
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      console.log('Layout - Platform:', webApp.platform);
      console.log('Layout - Safe Area Insets:', webApp.safeAreaInsets);
      console.log('Layout - Safe Area:', webApp.safeArea);
      console.log('Layout - Viewport Height:', webApp.viewportHeight);
      console.log('Layout - Is Expanded:', webApp.isExpanded);
    }
  }, [safeAreaInsets]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-blue-500 text-white text-xs p-1 z-50">
          Layout: T:{safeAreaInsets.top} R:{safeAreaInsets.right} B:{safeAreaInsets.bottom} L:{safeAreaInsets.left}
        </div>
      )}
      
      <main 
        className="flex-1 w-full max-w-full md:max-w-[800px] overflow-auto md:mx-auto md:my-4 md:max-h-[600px]"
        style={{
          paddingTop: `${safeAreaInsets.top}px`,
          paddingBottom: `${safeAreaInsets.bottom}px`,
          paddingLeft: `${safeAreaInsets.left}px`,
          paddingRight: `${safeAreaInsets.right}px`,
        }}
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
      <body className={`${comicNeue.className} antialiased w-full flex flex-col overflow-hidden`}>
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
