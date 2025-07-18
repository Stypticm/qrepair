'use client';

import { Section, Cell, List } from '@telegram-apps/telegram-ui';
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

  useEffect(() => {
    if (!telegramId) return

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
    fetchStep()
  }, [telegramId])

  return (
    <Page back={false}>
      <List className='h-full w-full bg-background'>
        <section className="flex flex-col justify-center overflow-y-auto h-full w-full">
          <Image
            src="/picture.png"
            alt="Main picture"
            width={400}
            height={400}
            className="w-full h-full"
          />
          <div className="p-2">
            <MainButtons path={path} />
          </div>
          <Link href="/init-data">Init data</Link>
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
