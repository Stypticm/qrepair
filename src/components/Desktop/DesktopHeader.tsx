'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { cn } from '@/lib/utils';

import { usePathname } from 'next/navigation';
import { useState, memo, useEffect } from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { QRModal } from './QRModal';
import { AuthModal } from '@/components/MobileApp/AuthModal';
import { LogIn } from 'lucide-react';

export const DesktopHeader = () => {
    const username = useAppStore(state => state.username);
    const userPhotoUrl = useAppStore(state => state.userPhotoUrl);
    const telegramId = useAppStore(state => state.telegramId);
    const role = useAppStore(state => state.role);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const pathname = usePathname();
    const { isDesktop } = useSafeArea();
    const { count: adminNotifs, leads, skupka, orders, tradeIn } = useAdminNotifications();
    const { count: orderNotifs } = useOrderNotifications();
    const { needsUpdate, performUpdate } = useVersionCheck();

    // Force check for LH admin if store seems empty but we are on LH
    useEffect(() => {
        if (typeof window !== 'undefined' && !telegramId && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            useAppStore.getState().initializeTelegram();
        }
    }, [telegramId]);

    const isActive = (path: string) => pathname === path;

    const navLinkClass = (path: string) => `
        px-4 py-2 rounded-xl text-base font-medium transition-all duration-200
        ${isActive(path)
            ? 'bg-gray-100 text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
    `;

    return (
        <>
            <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5 rounded-2xl h-20 flex items-center justify-between px-6 pointer-events-auto transition-all duration-300">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group mr-8">
                        <div className="w-9 h-9 relative overflow-hidden rounded-xl shadow-sm">
                            <Image
                                src={getPictureUrl('submit.png')}
                                alt="Qoqos Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:opacity-80 transition-opacity">
                            Qoqos
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center gap-2 flex-1">
                        <Link href="/" className={navLinkClass('/')}>
                            Главная
                        </Link>

                        <Link href="/buyback" className={navLinkClass('/buyback')}>
                            Скупка
                        </Link>

                        <Link href="/repair" className={navLinkClass('/repair')}>
                            Ремонт
                        </Link>

                        <div className="w-px h-6 bg-gray-200 mx-2"></div>

                        {!isAdminTelegramId(telegramId) && (
                            <>
                                <Link href="/favorites" className={navLinkClass('/favorites')}>
                                    Избранное
                                </Link>

                                <Link href="/my-devices" className={cn(navLinkClass('/my-devices'), "relative")}>
                                    Заказы
                                    {orderNotifs > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {orderNotifs}
                                        </span>
                                    )}
                                </Link>

                                <Link href="/cart" className={navLinkClass('/cart')}>
                                    Корзина
                                </Link>
                            </>
                        )}

                        {(isAdminTelegramId(telegramId) || role === 'master') && (
                            <Link href="/admin" className={cn(navLinkClass('/admin'), "relative group/admin")}>
                                Админ
                                {adminNotifs > 0 && (
                                    <>
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {adminNotifs}
                                        </span>
                                        <div className="absolute top-full right-0 mt-2 opacity-0 group-hover/admin:opacity-100 transition-all pointer-events-none z-[60] scale-95 group-hover/admin:scale-100">
                                            <div className="bg-gray-900/95 backdrop-blur-sm text-white text-[10px] p-2 rounded-xl shadow-xl border border-white/10 min-w-[120px] space-y-1">
                                                {[
                                                    { label: 'Заказы', count: orders },
                                                    { label: 'Перезвоны', count: leads },
                                                    { label: 'Трейд-ин', count: tradeIn },
                                                    { label: 'Скупка', count: skupka }
                                                ].filter(d => d.count > 0).map((d, i) => (
                                                    <div key={i} className="flex justify-between items-center gap-4 text-left">
                                                        <span className="opacity-60 whitespace-nowrap">{d.label}</span>
                                                        <span className="font-bold text-teal-400">{d.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Link>
                        )}

                        <span
                            className="px-4 py-2 rounded-xl text-base font-medium text-gray-300 cursor-not-allowed select-none transition-all duration-200"
                        >
                            Контакты
                        </span>
                    </nav>

                    {/* CTA & Auth */}
                    <div className="flex items-center gap-4">
                        {/* Auth Status */}
                        {telegramId ? (
                            <div className="hidden md:flex items-center gap-3 mr-2 bg-gray-50 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 dark:bg-zinc-900 dark:border-white/10">
                                {userPhotoUrl ? (
                                    <Image
                                        src={userPhotoUrl}
                                        alt={username || 'User'}
                                        width={28}
                                        height={28}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">
                                        {(username?.[0] || telegramId?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                    {username || telegramId || 'Пользователь'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        useAppStore.getState().logout();
                                    }}
                                    className="ml-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all dark:hover:bg-red-900/20"
                                    title="Выйти"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        ) : null}

                        {/* Update Button */}
                        {needsUpdate && (
                            <button
                                onClick={performUpdate}
                                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all shadow-md animate-pulse"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                                </svg>
                                <span>Обновить</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsQRModalOpen(true)}
                            className="hidden md:block px-6 py-2.5 bg-gray-900 text-white text-base font-medium rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                        >
                            Оценить
                        </button>
                    </div>
                </div>
            </header>

            <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};
