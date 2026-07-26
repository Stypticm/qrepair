'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BarChart3, Plus, ShoppingBag, MessageCircle, Smartphone, Wrench, LogOut, Home, ArrowLeft, Newspaper } from 'lucide-react';
import { useUserRole, getSectionsForRole } from '@/hooks/useUserRole';
import { useAppStore } from '@/stores/authStore';

// Порядок: дашборд → операционные разделы → каталог/товары → коммуникации → команда → контент
const allSections = [
    // Общее
    { id: '', title: 'Дашборд', icon: BarChart3 },

    // Операционный блок
    { id: 'orders', title: 'Заказы', icon: ShoppingBag },
    { id: 'leads', title: 'Быстрые заявки', icon: ShoppingBag },
    { id: 'trade-in', title: 'Оценки', icon: Smartphone },
    { id: 'repair', title: 'Ремонт', icon: Wrench },

    // Товары
    { id: 'catalog', title: 'Каталог', icon: ShoppingBag },
    { id: 'add-lot', title: 'Новый лот', icon: Plus },

    // Коммуникации
    { id: 'chats', title: 'Чат-центр', icon: MessageCircle },

    // Команда
    { id: 'staff', title: 'Персонал', icon: Users },
    { id: 'masters', title: 'Мастера', icon: Wrench },

    // Контент
    { id: 'blog', title: 'Блог', icon: Newspaper },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { role } = useUserRole();
    const logout = useAppStore(state => state.logout);

    // Дашборд всегда доступен + разрешенные секции
    const allowedIds = getSectionsForRole(role || 'ADMIN');
    const adminSections = allSections.filter(s => s.id === '' || allowedIds.includes(s.id));

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-white/5 pt-6 pb-8 sticky top-0 overflow-y-auto">
            <div className="px-6 mb-8">
                <div className="flex flex-col gap-4 mb-2">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
                            <span className="text-white dark:text-[#0a0a0a] font-bold tracking-tighter">Q</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Admin</span>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Вернуться на сайт
                    </Link>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {role || 'ADMIN'}
                </div>
            </div>

            <div className="flex-1 px-4 space-y-1 overflow-y-auto">
                {adminSections.map((section) => {
                    const href = `/admin${section.id ? `/${section.id}` : ''}`;
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={section.id || 'dash'}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <section.icon className={`w-5 h-5 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                            {section.title}
                        </Link>
                    );
                })}
            </div>

            <div className="px-4 mt-auto pt-6 border-t border-gray-50 dark:border-white/5">
                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/';
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Выйти
                </button>
            </div>
        </aside>
    );
}
