'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { useAppStore } from '@/stores/authStore';
import { TelegramLoginButton } from '@/components/TelegramLoginButton';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { QRModal } from './QRModal';

export const DesktopHeader = () => {
    const { username, userPhotoUrl, telegramId } = useAppStore();
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navLinkClass = (path: string) => `
        px-4 py-2 rounded-xl text-base font-medium transition-all duration-200
        ${isActive(path)
            ? 'bg-gray-100 text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
    `;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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
                        {/* <span className="ml-2 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                            Market
                        </span> */}
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

                        <Link href="/favorites" className={navLinkClass('/favorites')}>
                            Избранное
                        </Link>

                        <Link href="/cart" className={navLinkClass('/cart')}>
                            Корзина
                        </Link>

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
                            <div className="hidden md:flex items-center gap-3 mr-2 bg-gray-50 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 transition-colors hover:border-gray-300 dark:bg-zinc-900 dark:border-white/10">
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
                                        {(username?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {username || 'Пользователь'}
                                </span>
                                <button
                                    onClick={() => useAppStore.getState().logout()}
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
                        ) : (
                            <div className="hidden md:flex">
                                <TelegramLoginButton />
                            </div>
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
        </>
    );
};
