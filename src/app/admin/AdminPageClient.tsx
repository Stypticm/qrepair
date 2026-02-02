'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, Plus, ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';

export function AdminPageClient() {
  const router = useRouter();
  const { telegramId } = useAppStore();
  const [accessDenied, setAccessDenied] = useState<boolean | null>(null);

  // Проверяем права доступа
  useEffect(() => {
    const checkAccess = () => {
      const currentTelegramId =
        telegramId || (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

      if (currentTelegramId) {
        const isAdmin = isAdminTelegramId(currentTelegramId);
        setAccessDenied(!isAdmin);
        return true;
      }
      return false;
    };

    if (checkAccess()) {
      return;
    }

    // Если telegramId еще не загружен, ждем
    const timer = setTimeout(() => {
      if (!checkAccess()) {
        setAccessDenied(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [telegramId]);

  if (accessDenied === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-4">У вас нет прав для доступа к админ панели</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      id: 'masters',
      title: 'Управление мастерами',
      description: 'Добавление, редактирование и удаление мастеров',
      icon: Users,
      color: 'bg-teal-500',
    },
    {
      id: 'requests',
      title: 'Заявки',
      description: 'Просмотр и управление заявками',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      id: 'orders',
      title: 'Заказы',
      description: 'Управление заказами из магазина',
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      id: 'add-lot',
      title: 'Добавление лота',
      description: 'Создание нового лота с фото и характеристиками',
      icon: Plus,
      color: 'bg-green-500',
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'masters') {
      router.push('/admin/masters');
    } else if (sectionId === 'requests') {
      router.push('/admin/requests');
    } else if (sectionId === 'orders') {
      router.push('/admin/orders');
    } else if (sectionId === 'add-lot') {
      router.push('/admin/add-lot');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b pt-12">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-gray-900 font-sf-pro">
              Админ-панель
            </h1>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto p-6 pt-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Управление системой
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Card
                    key={section.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${section.color} text-white shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {section.title}
                          </CardTitle>
                          <p className="text-gray-600 text-sm mt-1">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Нажмите для перехода
                        </span>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
