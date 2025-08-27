import type { PropsWithChildren } from 'react';
import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';
import { Comic_Neue } from 'next/font/google';
import { StartFormProvider } from '@/components/StartFormContext/StartFormContext';
import { ClientLayoutContent } from '@/components/ClientLayoutContent/ClientLayoutContent';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import './globals.css';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap', // Улучшает FOUT (Flash of Unstyled Text)
  preload: true,   // Предзагружает шрифт
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="QtweRepair - быстрый выкуп смартфонов" />
        <meta name="theme-color" content="#17212b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${comicNeue.className} antialiased w-full flex flex-col overflow-hidden`}>
        <I18nProvider>
          <Root>
            <StartFormProvider>
              <ClientLayoutContent>
                {children}
              </ClientLayoutContent>
            </StartFormProvider>
          </Root>
        </I18nProvider>
      </body>
    </html>
  );
}