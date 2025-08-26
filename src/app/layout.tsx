'use client';

import type { PropsWithChildren } from 'react';

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';
import { Comic_Neue } from 'next/font/google';

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
              <main className="flex-1 h-screen w-full max-w-full md:max-w-[800px] overflow-auto md:mx-auto md:my-4 md:max-h-[600px]">
                {children}
              </main>
            </StartFormProvider>
          </Root>
        </I18nProvider>
      </body>
    </html>
  );
}
