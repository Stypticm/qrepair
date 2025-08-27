'use client';

import Image from 'next/image';

import { Link } from '@/components/Link/Link';
import tonSvg from './_assets/ton.svg';
import picture from './_assets/picture.png';
import { Button } from '@/components/ui/button';

import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useEffect, useState } from 'react';
import { getPictureUrl } from '@/core/lib/assets';
import { useRouter } from 'next/navigation';

import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';

export default function Home() {
  const { telegramId, setModel } = useStartForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Telegram WebApp expand() теперь обрабатывается в хуке useSafeArea
    // if (window.Telegram?.WebApp) {
    //   window.Telegram.WebApp.expand();
    // } else {
    //   console.warn('Telegram WebApp not initialized');
    // }

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
    //     }
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }

    // sendStartCommand()
    // fetchStep()
  }, [telegramId])

  return (
    <AdaptiveContainer>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f9ecb8]">
        <div className="w-full max-w-md mx-auto text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-black mb-4">
              💰 ВЫКУП ТЕЛЕФОНА
            </h1>
            <p className="text-lg font-bold text-black mb-4 leading-tight">
              🚀 Продай свой смартфон за 3 минуты.
              <br />Мы оценим его по фото, приедем и заберём. Деньги — сразу на карту или наличными.
            </p>
            <Image
              src={getPictureUrl('courier.png') || '/courier.png'}
              alt="Курьер с телефоном"
              width={400}
              height={200}
              className="w-full h-auto object-contain mb-4"
            />
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="outline"
                className="w-full bg-[#f9ecb8] text-black font-bold uppercase border-3 !border-slate-700"
                onClick={() => router.push('/request/choose')}
              >
                ✅ ОЦЕНИТЬ СМАРТФОН
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[#f9ecb8] text-black font-bold uppercase border-3 !border-slate-700"
                onClick={() => router.push('/my-devices')}
              >
                📋 МОИ УСТРОЙСТВА
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[#f9ecb8] text-black font-bold uppercase border-3 !border-slate-700"
                onClick={() => router.push('/learn-more')}
              >
                📦 КАК ЭТО РАБОТАЕТ?
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[#f9ecb8] text-black font-bold uppercase border-3 !border-slate-700"
                onClick={() => router.push('/questions')}
              >
                ❓ ЧАСТЫЕ ВОПРОСЫ
              </Button>

            </div>
            <div className="mt-6 text-lg text-slate-700 w-full font-semibold">
              <p>🔐 Безопасно: договор и выезд с курьером</p>
              <p>💰 Гарантия честной цены</p>
              {/* <p>👽 Оценка через ИИ и вручную — на выбор</p> */}
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
        </div>
      </div>
    </AdaptiveContainer>
  );
}
