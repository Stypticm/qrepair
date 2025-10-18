'use client';

import React, { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Фейковые данные для аксессуаров
const mockAccessories = [
  {
    id: 'acc-1',
    title: 'Чехол для iPhone 15 Pro',
    description: 'Прозрачный силиконовый чехол с защитой от падений',
    price: 2500,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-15',
    model: 'iPhone 15 Pro',
    storage: 'Универсальный',
    color: 'Прозрачный',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  },
  {
    id: 'acc-2',
    title: 'Беспроводные наушники AirPods Pro',
    description: 'Активное шумоподавление и пространственное аудио',
    price: 25000,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-14',
    model: 'AirPods Pro 2',
    storage: '32GB',
    color: 'Белый',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  },
  {
    id: 'acc-3',
    title: 'Зарядное устройство MagSafe',
    description: 'Быстрая беспроводная зарядка с магнитным креплением',
    price: 4500,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-13',
    model: 'MagSafe Charger',
    storage: '15W',
    color: 'Белый',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  },
  {
    id: 'acc-4',
    title: 'Кабель Lightning-USB-C',
    description: 'Оригинальный кабель для зарядки и синхронизации',
    price: 2000,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-12',
    model: 'Lightning Cable',
    storage: '1м',
    color: 'Белый',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  },
  {
    id: 'acc-5',
    title: 'Защитное стекло для экрана',
    description: 'Закаленное стекло с олеофобным покрытием',
    price: 1500,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-11',
    model: 'Tempered Glass',
    storage: 'Универсальный',
    color: 'Прозрачный',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  },
  {
    id: 'acc-6',
    title: 'Портативная батарея Power Bank',
    description: 'Внешний аккумулятор на 10000 мАч с быстрой зарядкой',
    price: 3500,
    cover: '/display_front_new.png',
    photos: ['/display_front_new.png', '/display_front_scratches.png'],
    date: '2024-01-10',
    model: 'Power Bank 10K',
    storage: '10000 мАч',
    color: 'Черный',
    condition: 'Новый',
    seller: 'Apple Store',
    location: 'Москва'
  }
];

export default function AccessoriesPage() {
  const router = useRouter();
  const [accessories, setAccessories] = useState(mockAccessories);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    // В реальном приложении здесь был бы запрос к API
    console.log('Loading more accessories...');
  };

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200 px-4 py-6 pt-16 text-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Аксессуары</h1>
              <p className="text-gray-600 text-sm">Чехлы, наушники, зарядки и другие аксессуары</p>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="px-4 py-6">
          <AdaptiveDeviceFeed
            items={accessories}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={false}
            mode="grid"
            showRecommendationsButton={false}
          />
        </div>
      </div>
    </Page>
  );
}
