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
import { repairSteps } from '@/core/lib/constants';

export default function Home() {
  const t = useTranslations('i18n');
  const { telegramId, setBrand, setModel, setBrandModelText, setCrash, setCrashDescription, setPhotoUrls } = useStartForm();
  const [path, setPath] = useState('/repair/choose');
  const [isAdmin, setIsAdmin] = useState(false);

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

    const fetchStep = async () => {
      try {
        const res = await fetch(`/api/step?telegramId=${telegramId}`)
        const data = await res.json()

        if (data?.existing) {
          const req = data.existing

          setBrand(req.brandname ?? null)
          setModel(req.modelname ?? '')
          setBrandModelText(req.brandModelText ?? '')
          setCrash(req.crash ? req.crash.split(',').map((c: string) => c.trim()) : [])
          setCrashDescription(req.crashDescription ?? '')
          setPhotoUrls(req.photoUrls ?? [])

          const matchedStep = repairSteps.find((s) => s.currentStep === req.currentStep)
          if (matchedStep) {
            setPath(matchedStep.path)
            return
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    // sendStartCommand()
    fetchStep()
  }, [telegramId])

  return (
    <Page back={false}>
      <div className="flex flex-col items-center justify-start w-screen h-screen p-2">
        <div className="w-full">
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full bg-slate-800 text-black font-bold uppercase !border-slate-700"
            >
              <Link href="/admin">АДМИН</Link>
            </Button>
          )}
          <div className="w-full">
            <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2">
              💰 ВЫКУП СМАРТФОНА
            </h2>
            <p className="text-base font-bold text-black mb-4 leading-tight">
              🚀 Продай свой смартфон за 3 минуты. Мы оценим его по фото, приедем и заберём. Деньги — сразу на карту или наличными.
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
                onClick={() => window.Telegram.WebApp.showAlert('В разработке')}
              >
                ✅ ОЦЕНИТЬ СМАРТФОН
              </Button>
              <Button
                variant="outline"
                className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              >
                📦 КАК ЭТО РАБОТАЕТ?
              </Button>
              <Button
                variant="outline"
                className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              >
                🕵️ СТАТУС ЗАЯВКИ
              </Button>
              <Button
                variant="outline"
                className="w-full bg-background text-black font-bold uppercase border-3 !border-slate-700"
              >
                📋 МОИ УСТРОЙСТВА
              </Button>
            </div>
            <div className="mt-6 text-sm text-slate-700 w-full font-semibold">
              <p>🔐 Безопасно: договор и выезд с курьером</p>
              <p>💰 Гарантия честной цены</p>
              <p>👽 Оценка через ИИ и вручную — на выбор</p>
            </div>
          </div>
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
