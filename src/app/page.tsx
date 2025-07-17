'use client';

import { Section, Cell, Image, List } from '@telegram-apps/telegram-ui';
import { useTranslations } from 'next-intl';

import { Link } from '@/components/Link/Link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { Page } from '@/components/Page';

import tonSvg from './_assets/ton.svg';
import { Button } from '@/components/ui/button';
import MainButtons from '@/components/MainButtons/MainButtons';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  const t = useTranslations('i18n');

  return (
    <Page back={false}>
      <List>
        <section className="flex flex-col overflow-y-auto">
          <div className="w-full overflow-hidden flex justify-center basis-1/3">
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              width={0}
              height={0}
              sizes="(max-width: 668px) 90vw, 400px"
              className="w-full max-w-xs bg-slate-700 rounded-md p-2 border-slate-700"
            />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <MainButtons />
          </div>

          <div className="flex-1 flex items-end justify-center">
            <Footer />
          </div>
        </section>
        {/* <List>
        <Section
        header="Features"
        footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
        <Link href="/ton-connect">
        <Cell
        before={
          <Image
          src={tonSvg.src}
          style={{ backgroundColor: '#007AFF' }}
          alt="TON Logo"
          />
          }
          subtitle="Connect your TON wallet"
          >
          TON Connect
          </Cell>
          </Link>
          </Section>
          
          <Section header={t('header')} footer={t('footer')}>
          <LocaleSwitcher />
          </Section>
          </List> */}
      </List>
    </Page>
  );
}
