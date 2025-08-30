'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

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
  const { telegramId, setModel, resetAllStates } = useStartForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Telegram WebApp expand() теперь обрабатывается в хуке useSafeArea
    if (window.Telegram?.WebApp) {
      // Принудительно разворачиваем на весь экран
      window.Telegram.WebApp.expand();
      
      // Устанавливаем настройки для full screen
      window.Telegram.WebApp.headerColor = '#f9ecb8'; // Цвет заголовка
      window.Telegram.WebApp.backgroundColor = '#ffffff'; // Цвет фона
      
      // Показываем кнопку "Закрыть" для лучшего UX
      window.Telegram.WebApp.enableClosingConfirmation();
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
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50 pt-20">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          <div className="space-y-6">
            <Image
              src={getPictureUrl('logo2.png') || '/logo2.png'}
              alt="Логотип"
              width={300}
              height={150}
              className="w-full h-auto object-contain mx-auto rounded-2xl shadow-lg"
            />
            
            <div className="flex flex-col gap-4 w-full">
              <Button
                variant="outline"
                className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/request/form')}
              >
                Оценить смартфон
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium text-base rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/my-devices')}
              >
                Мои устройства
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-medium text-base rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/learn-more')}
              >
                Как это работает
              </Button>
            </div>
          </div>

          <div className='fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2'>
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm rounded-xl border-0 shadow-lg transition-all duration-200"
              >
                <Link href="/admin">Админ</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdaptiveContainer>
  );
}
