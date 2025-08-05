'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Link } from '@/components/Link/Link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { Page } from '@/components/Page';

import tonSvg from './_assets/ton.svg';
import picture from './_assets/picture.png';
import { Button } from '@/components/ui/button';
import MainButtons from '@/components/MainButtons/MainButtons';
import Footer from '@/components/Footer/Footer';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const t = useTranslations('i18n');
  const { telegramId, setModel, setPhotoUrls } = useStartForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    } else {
      console.warn('Telegram WebApp not initialized');
    }

    if (!telegramId) return

    if (telegramId === '1' || telegramId === '296925626' || telegramId === '531360988') {
      setIsAdmin(true)
    }

    // const sendStartCommand = async () => {
    //   try {
    //     const response = await fetch('/api/telegram/send-command', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ telegramId, command: '/start' }),
    //     });

    //     if (!response.ok) {
    //       throw new Error('Failed to send /start command');
    //     }
    //     console.log('Successfully sent /start command');
    //   } catch (error) {
    //     console.error('Error sending /start command:', error);
    //   }
    // };

    // const fetchStep = async () => {
    //   try {
    //     const res = await fetch(`/api/step?telegramId=${telegramId}`)
    //     const data = await res.json()

    //     if (data?.existing) {
    //       const req = data.existing
    //       setModel(req.modelname ?? '')
    //       setPhotoUrls(req.photoUrls ?? [])
    //     }
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }

    // sendStartCommand()
    // fetchStep()
  }, [telegramId])

  return (
    <Page back={false}>
      <div className="flex flex-col items-center justify-start p-4">
        <div className="w-full">
          <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">
            💰 ВЫКУП СМАРТФОНА
          </h2>
          <p className="text-lg font-bold text-black mb-4 leading-tight">
            🚀 Продай свой смартфон за 3 минуты.
            <br />Мы оценим его по фото, приедем и заберём. Деньги — сразу на карту или наличными.
          </p>
          <Image
            src="/courier.png"
            alt="Курьер с телефоном"
            width={400}
            height={200}
            className="w-full h-auto object-contain mb-4"
          />
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              onClick={() => router.push('/request/choose')}
            >
              ✅ ОЦЕНИТЬ СМАРТФОН
            </Button>
            <Button
              variant="outline"
              className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              onClick={() => router.push('/my-devices')}
            >
              📋 МОИ УСТРОЙСТВА
            </Button>
            <Button
              variant="outline"
              className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              onClick={() => router.push('/learn-more')}
            >
              📦 КАК ЭТО РАБОТАЕТ?
            </Button>
            <Button
              variant="outline"
              className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              onClick={() => router.push('/questions')}
            >
              ❓ ЧАСТЫЕ ВОПРОСЫ
            </Button>

          </div>
          <div className="mt-6 text-lg text-slate-700 w-full font-semibold">
            <p>🔐 Безопасно: договор и выезд с курьером</p>
            <p>💰 Гарантия честной цены</p>
            <p>👽 Оценка через ИИ и вручную — на выбор</p>
          </div>
        </div>
        <div className='fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2'>
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full bg-slate-800 text-black font-bold uppercase !border-slate-700"
            >
              <Link href="/admin">АДМИН</Link>
            </Button>
          )}
        </div>

        {/* <div className="p-2">
            <MainButtons path={path} />
            </div> */}
        {/* <Link href="/init-data">Init data</Link> */}
        {/* <div className="flex-1 flex items-center justify-center">
            <Link
            href="/learn-more"
            className="text-blue-300 underline font-bold text-lg hover:text-blue-500 transition"
            >
            Learn more
            </Link>
            </div> */}
        {/* <div className="flex-1 flex items-end justify-center">
            <Footer />
            </div> */}
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
      </div>
    </Page>
  );
}
