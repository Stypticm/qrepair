'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, Plus, ShoppingBag, MessageCircle, ArrowRight, Smartphone, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { PushNotificationToggle } from '@/components/notifications/PushNotificationToggle';
import { useUserRole, getSectionsForRole } from '@/hooks/useUserRole';
import { useSafeArea } from '@/hooks/useSafeArea';

export function AdminPageClient() {
  const router = useRouter();
  const { telegramId } = useAppStore();
  const { isStandalone } = useSafeArea();
  const sourceParam = isStandalone ? '?source=pwa' : '';
  const { role, isLoading: roleLoading, hasAdminAccess } = useUserRole();
  const [accessDenied, setAccessDenied] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<{ repairs: number; tradeIns: number; orders: number } | null>(null);

  useEffect(() => {
    if (roleLoading) return;

    if (hasAdminAccess) {
      setAccessDenied(false);
      return;
    }

    const currentTelegramId =
      telegramId || (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

    if (currentTelegramId && isAdminTelegramId(currentTelegramId)) {
      setAccessDenied(false);
    } else {
      setAccessDenied(true);
    }
  }, [telegramId, roleLoading, hasAdminAccess]);

  useEffect(() => {
    if (accessDenied === false) {
      const fetchMetrics = async () => {
        try {
          const id = telegramId || sessionStorage.getItem('telegramId');
          const res = await fetch('/api/admin/stats', {
            headers: { 'x-telegram-id': id?.toString() || '' }
          });
          const data = await res.json();
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        } catch (error) {
          console.error('Error fetching metrics', error);
        }
      };
      fetchMetrics();
    }
  }, [accessDenied, telegramId]);

  if (accessDenied === null) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m14.5 9-5 5" /><path d="m9.5 9 5 5" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Доступ ограничен</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">К сожалению, у вашей учетной записи ({telegramId || 'не авторизован'}) нет прав для просмотра этого раздела.</p>
          <button
            onClick={() => router.push(`/${sourceParam}`)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const allSections = [
    { id: 'masters', title: 'Мастера', description: 'Управление командой', icon: Users, color: 'bg-indigo-500' },
    { id: 'requests', title: 'Заявки', description: 'Обработка запросов', icon: BarChart3, color: 'bg-amber-500' },
    { id: 'orders', title: 'Заказы', description: 'Логистика магазина', icon: ShoppingBag, color: 'bg-emerald-500' },
    { id: 'add-lot', title: 'Новый лот', description: 'Публикация товаров', icon: Plus, color: 'bg-rose-500' },
    { id: 'chats', title: 'Чат-центр', description: 'Связь с клиентами', icon: MessageCircle, color: 'bg-sky-500' },
    { id: 'leads', title: 'Быстрые заявки', description: 'Лиды «в 1 клик»', icon: ShoppingBag, color: 'bg-pink-500' },
    { id: 'trade-in', title: 'Оценки', description: 'Расчет стоимости устройств', icon: Smartphone, color: 'bg-blue-600' },
    { id: 'repair', title: 'Ремонт', description: 'Заявки на ремонт', icon: Wrench, color: 'bg-amber-500' },
  ];

  const allowedIds = getSectionsForRole(role || (accessDenied === false ? 'ADMIN' : null));
  const adminSections = allSections.filter(s => allowedIds.includes(s.id));

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-16 md:pt-24 pb-20 md:pb-12 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 w-full">
        {/* Header Section */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/5 text-gray-900 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
              Панель управления ({role || 'ADMIN'})
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
              Qoqos Admin
            </h1>
            <p className="text-sm md:text-xl text-gray-500 font-medium">
              Управляйте бизнесом с любого устройства.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <PushNotificationToggle />
            <button
              onClick={() => router.push(`/${sourceParam}`)}
              className="group flex-1 md:flex-none justify-center flex items-center gap-2 px-4 md:px-6 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-600 text-sm md:text-base font-bold hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm active:scale-95"
            >
              <span className="md:hidden">На сайт</span>
              <span className="hidden md:inline">На главный сайт</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {adminSections.map((section) => (
            <motion.div
              key={section.id}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push(`/admin/${section.id}`)}
              className="group cursor-pointer"
            >
              <Card className="relative h-full border-none shadow-[0_4px_12px_rgba(0,0,0,0.02)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:min-h-[280px]">
                {metrics && section.id === 'repair' && metrics.repairs > 0 && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-red-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg shadow-red-500/30">
                    {metrics.repairs}
                  </div>
                )}
                {metrics && section.id === 'trade-in' && metrics.tradeIns > 0 && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-red-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg shadow-red-500/30">
                    {metrics.tradeIns}
                  </div>
                )}
                {metrics && section.id === 'orders' && metrics.orders > 0 && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-red-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg shadow-red-500/30">
                    {metrics.orders}
                  </div>
                )}
                <div>
                  <div className={`w-10 h-10 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.5rem] ${section.color} flex items-center justify-center text-white mb-4 md:mb-8 shadow-lg shadow-${section.color.split('-')[1]}-200/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <section.icon className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black text-gray-900 mb-1 md:mb-2 leading-tight">{section.title}</h3>
                  <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-relaxed hidden md:block">{section.description}</p>
                </div>

                <div className="mt-4 md:mt-8 flex items-center justify-between">
                  <span className="hidden md:block text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-widest">Перейти</span>
                  <div className="w-8 h-8 md:w-10 md:h-10 ml-auto md:ml-0 rounded-full bg-gray-50 md:bg-transparent md:border border-gray-100 flex items-center justify-center text-gray-400 md:text-gray-300 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
