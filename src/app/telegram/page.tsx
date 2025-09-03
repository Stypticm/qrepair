'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';

export default function TelegramRedirectPage() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram
    const checkTelegram = () => {
      if (typeof window !== 'undefined') {
        const isInTelegram = !!(window as any).Telegram?.WebApp;
        setIsTelegram(isInTelegram);
        setIsLoading(false);
        
        // Если пользователь уже в Telegram, перенаправляем на главную
        if (isInTelegram) {
          router.push('/');
        }
      }
    };

    // Небольшая задержка для лучшего UX
    const timer = setTimeout(checkTelegram, 500);
    return () => clearTimeout(timer);
  }, [router]);





  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2dc2c6] mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем...</p>
        </div>
      </div>
    );
  }

  // Если пользователь в Telegram, не показываем эту страницу
  if (isTelegram) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {/* Логотип */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center"
            >
              <Image
                src={getPictureUrl('logo_repair.png') || '/logo_repair.png'}
                alt="Логотип"
                width={200}
                height={100}
                className="object-contain"
              />
            </motion.div>

            {/* Заголовок */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                🚧 Приложение в разработке
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Наше приложение находится в стадии разработки и будет доступно в Telegram боте для максимального удобства и безопасности
              </p>
            </motion.div>

            {/* Преимущества */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-2 text-sm text-gray-500"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Быстрая работа</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🎨</span>
                <span>Удобный интерфейс</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Уведомления о статусе</span>
              </div>
            </motion.div>



            {/* Дополнительная информация */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-xs text-gray-400 pt-2"
            >
              <p>
                Скоро будет доступно в Telegram боте
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
