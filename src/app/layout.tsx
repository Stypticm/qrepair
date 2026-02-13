import { ReactQueryProvider } from '@/lib/react-query-provider';
import { I18nProvider } from '@/core/i18n/provider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Comic_Neue } from 'next/font/google';
import { ClientLayoutContent } from '@/components/ClientLayoutContent/ClientLayoutContent';
import { Toaster } from 'sonner';

import '@telegram-apps/telegram-ui/dist/styles.css';
import Script from 'next/script';
import 'normalize.css/normalize.css';
import './globals.css';
import { TelegramInit } from '@/components/TelegramInit';

import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

import { type Metadata, type Viewport } from 'next';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://qrepair.vercel.app'),
  title: 'Qoqos',
  description: 'Qoqos - Выкуп смартфонов',
  icons: {
    icon: '/favicon.ico',
    apple: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        <TelegramInit />
        <ServiceWorkerRegister />

        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>
              <ClientLayoutContent>
                {children}
              </ClientLayoutContent>
            </I18nProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
