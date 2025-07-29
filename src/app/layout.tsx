import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

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


export const metadata: Metadata = {
  title: 'QtweRepair',
  description: 'Repair your phone with QtweRepair',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className="h-full overflow-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${comicNeue.className} antialiased h-full w-full flex flex-col overflow-hidden`}>
        <I18nProvider>
          <Root>
            <StartFormProvider>
              <main className="flex-1 w-full max-w-[800px] mx-auto md:max-h-[600px] md:mx-auto md:my-4">
                {children}
              </main>
            </StartFormProvider>
          </Root>
        </I18nProvider>
      </body>
    </html>
  );
}
