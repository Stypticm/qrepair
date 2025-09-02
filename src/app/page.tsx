'use client';

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { Link } from '@/components/Link/Link';
import tonSvg from './_assets/ton.svg';
import picture from './_assets/picture.png';
import { Button } from '@/components/ui/button';
import { getPictureUrl } from '@/core/lib/assets';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { ExpandButton } from '@/components/ExpandButton';
import { tailwindColors } from '@/core/colors';
import { ChatContext } from '@/components/ChatContext';
import { useSafeArea } from '@/hooks/useSafeArea';

export default function Home() {
  const { telegramId, setModel, resetAllStates } = useStartForm();
  const { forceFullscreen, isFullscreen } = useSafeArea();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Принудительно вызываем fullscreen при загрузке страницы
    if (!isFullscreen && window.Telegram?.WebApp) {
      console.log('Page loaded, forcing fullscreen at', new Date().toISOString());
      forceFullscreen();
    }

    if (!telegramId) return;

    if (telegramId === '1' || telegramId === '296925626' || telegramId === '531360988') {
      setIsAdmin(true);
    }
  }, [telegramId, isFullscreen, forceFullscreen]);

  return (
    <AdaptiveContainer>
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50 pt-20">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          <div className="space-y-6">
            <Image
              src={getPictureUrl(`logo.png`) || '/logo.png'}
              alt="Логотип"
              width={300}
              height={150}
              className="w-full h-auto object-contain mx-auto rounded-2xl shadow-lg"
            />

            <div className="flex flex-col gap-4 w-full">
              <Button
                variant="outline"
                className="w-full h-16 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
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

          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-1/2 flex flex-col gap-2">
            {/* Кнопка для принудительного расширения */}
            <ExpandButton className="w-full" />

            {isAdmin && (
              <Link href="/admin">
                <div className="w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer mx-auto overflow-hidden bg-white border border-gray-200 hover:border-gray-300">
                  <Image
                    src={getPictureUrl('admin_btn.png') || '/admin_btn.png'}
                    alt="Админ панель"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AdaptiveContainer>
  );
}