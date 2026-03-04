'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BarChart3, Plus, ShoppingBag, MessageCircle, Smartphone, Wrench, LogOut, Home, ArrowLeft, Newspaper } from 'lucide-react';
import { useUserRole, getSectionsForRole } from '@/hooks/useUserRole';
import { useAppStore } from '@/stores/authStore';

const allSections = [
    { id: '', title: 'Дашборд', icon: BarChart3 },
    { id: 'staff', title: 'Персонал', icon: Users },
    { id: 'masters', title: 'Мастера', icon: Wrench },
    { id: 'requests', title: 'Заявки', icon: BarChart3 },
    { id: 'orders', title: 'Заказы', icon: ShoppingBag },
    { id: 'add-lot', title: 'Новый лот', icon: Plus },
    { id: 'chats', title: 'Чат-центр', icon: MessageCircle },
    { id: 'leads', title: 'Быстрые заявки', icon: ShoppingBag },
    { id: 'trade-in', title: 'Оценки', icon: Smartphone },
    { id: 'repair', title: 'Ремонт', icon: Wrench },
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
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-100 pt-6 pb-8 sticky top-0 overflow-y-auto">
            <div className="px-6 mb-8">
                <div className="flex flex-col gap-4 mb-2">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold tracking-tighter">Q</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Admin</span>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all border border-gray-100 hover:border-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Вернуться на сайт
                    </Link>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
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
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <section.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            {section.title}
                        </Link>
                    );
                })}
            </div>

            <div className="px-4 mt-auto pt-6 border-t border-gray-50">
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
