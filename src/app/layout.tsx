import type { PropsWithChildren } from 'react';
import { I18nProvider } from '@/core/i18n/provider';
import { Comic_Neue } from 'next/font/google';
import { StartFormProvider } from '@/components/StartFormContext/StartFormContext';
import { ClientLayoutContent } from '@/components/ClientLayoutContent/ClientLayoutContent';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './globals.css';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap', // Улучшает FOUT (Flash of Unstyled Text)
  preload: true,   // Предзагружает шрифт
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="QRepair - Выкуп смартфонов" />
        <meta name="theme-color" content="#f9ecb8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <I18nProvider>
          <StartFormProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
          </StartFormProvider>
        </I18nProvider>
      </body>
    </html>
  )
}