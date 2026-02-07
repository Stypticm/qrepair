'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
    {
      id: 'chats',
      title: 'Чаты',
      description: 'Общение с клиентами в реальном времени',
      icon: MessageCircle,
      color: 'bg-orange-500',
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
    } else if (sectionId === 'chats') {
      router.push('/admin/chats');
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex">
      {/* Левая боковая панель для десктопа (опционально, но сделаем пока сетку) */}
      <div className="flex-1 flex flex-col">
        {/* Заголовок */}
        <header className="bg-white border-b sticky top-0 z-10 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Панель управления
              </h1>
              <p className="text-gray-500 mt-1">
                Добро пожаловать в админ-панель Qoqos
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border rounded-xl hover:bg-gray-50 transition-all"
            >
              На сайт
            </button>
          </div>
        </header>

        {/* Основной контент */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSectionClick(section.id)}
                    className="group"
                  >
                    <Card className="h-full cursor-pointer border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-3xl group">
                      <div className={`h-2 w-full ${section.color}`} />
                      <CardHeader className="pt-8 px-8">
                        <div className="flex items-start justify-between">
                          <div
                            className={`p-4 rounded-2xl ${section.color} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}
                          >
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
                            <Plus className="w-6 h-6 rotate-45" />
                          </div>
                        </div>
                        <div className="mt-8">
                          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            {section.title}
                          </CardTitle>
                          <p className="text-gray-500 leading-relaxed text-sm">
                            {section.description}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 pt-4">
                        <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                          <span>Управление</span>
                          <svg
                            className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
