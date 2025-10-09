import type { PropsWithChildren } from 'react';
import { ReactQueryProvider } from '@/lib/react-query-provider';
import { I18nProvider } from '@/core/i18n/provider';
import { Comic_Neue } from 'next/font/google';
import { ClientLayoutContent } from '@/components/ClientLayoutContent/ClientLayoutContent';
import { Toaster } from 'sonner';

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
        <meta name="description" content="Qoqos - Выкуп смартфонов" />
        <meta name="theme-color" content="#2dc2c6" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/logo2.png" />
      </head>
      <body style={{ backgroundColor: '#ffffff' }}>
        <ReactQueryProvider>
          <I18nProvider>
            <ClientLayoutContent>
              <div className="mini-app-container w-[896px] h-[414px] mx-auto">
                {children}
              </div>
            </ClientLayoutContent>
          </I18nProvider>
        </ReactQueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}