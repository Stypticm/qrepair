'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, Plus, ShoppingBag, MessageCircle, ArrowRight, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';

export function DesktopAdminPage() {
    const router = useRouter();
    const { telegramId } = useAppStore();
    const [accessDenied, setAccessDenied] = useState<boolean | null>(null);

    useEffect(() => {
        if (telegramId) {
            setAccessDenied(!isAdminTelegramId(telegramId));
        } else {
            // Wait a bit for store initialization
            const timer = setTimeout(() => {
                if (!useAppStore.getState().telegramId) {
                    setAccessDenied(true);
                } else {
                    setAccessDenied(!isAdminTelegramId(useAppStore.getState().telegramId));
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [telegramId]);

    if (accessDenied === null) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Загрузка панели управления...</p>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-sm px-6">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m14.5 9-5 5" /><path d="m9.5 9 5 5" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Доступ ограничен</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">К сожалению, у вашей учетной записи ({telegramId || 'не авторизован'}) нет прав для просмотра этого раздела.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        На главную
                    </button>
                </div>
            </div>
        );
    }

    const adminSections = [
        {
            id: 'masters',
            title: 'Мастера',
            description: 'Управление командой и доступами',
            icon: Users,
            color: 'bg-indigo-500',
        },
        {
            id: 'requests',
            title: 'Заявки',
            description: 'Оперативная обработка входящих запросов',
            icon: BarChart3,
            color: 'bg-amber-500',
        },
        {
            id: 'orders',
            title: 'Заказы',
            description: 'Статусы и логистика товаров магазина',
            icon: ShoppingBag,
            color: 'bg-emerald-500',
        },
        {
            id: 'add-lot',
            title: 'Новый лот',
            description: 'Публикация товаров в витрину',
            icon: Plus,
            color: 'bg-rose-500',
        },
        {
            id: 'chats',
            title: 'Чат-центр',
            description: 'Прямая связь и консультации клиентов',
            icon: MessageCircle,
            color: 'bg-sky-500',
        },
        {
            id: 'leads',
            title: 'Быстрые заявки',
            description: 'Лиды «в 1 клик» и горячие контакты',
            icon: ShoppingBag,
            color: 'bg-pink-500',
        },
        {
            id: 'trade-in',
            title: 'Trade-in Оценки',
            description: 'Просмотр и расчет стоимости сдаваемых устройств',
            icon: Smartphone,
            color: 'bg-blue-600',
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-24 pb-12 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto px-12 w-full">
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/5 text-gray-900 text-xs font-bold uppercase tracking-wider mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Администратор системы
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                            Qoqos Admin
                        </h1>
                        <p className="text-xl text-gray-500 font-medium">
                            Управляйте вашим бизнесом с любого устройства.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-bold hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm"
                    >
                        На главный сайт
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section) => (
                        <motion.div
                            key={section.id}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/admin/${section.id}`)}
                            className="group"
                        >
                            <Card className="h-full border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-[2.5rem] bg-white overflow-hidden p-8 flex flex-col justify-between min-h-[280px]">
                                <div>
                                    <div className={`w-16 h-16 rounded-[1.5rem] ${section.color} flex items-center justify-center text-white mb-8 shadow-lg shadow-${section.color.split('-')[1]}-200/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <section.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{section.title}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">{section.description}</p>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-widest">Перейти</span>
                                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300">
                                        <ArrowRight size={20} />
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
