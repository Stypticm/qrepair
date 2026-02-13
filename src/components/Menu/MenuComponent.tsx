'use client'

import { Smartphone as DevicesIcon, Heart, ShoppingCart, Settings, LogOut, RefreshCw, PlusSquare, MessageCircle, LogIn } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { useSafeArea } from '@/hooks/useSafeArea';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const MenuComponent = ({ userId, router, isLoading }: { userId: string | number | null, router: any, isLoading: boolean }) => {
    const { telegramId, logout } = useAppStore();
    const { needsUpdate, performUpdate } = useVersionCheck();
    const { isStandalone } = useSafeArea();
    const sourceParam = isStandalone ? '?source=pwa' : '';

    const handleLoginClick = () => {
        const event = new CustomEvent('openLoginModal');
        window.dispatchEvent(event);
    };

    const handlePwaInstallClick = () => {
        const event = new CustomEvent('showPwaPrompt');
        window.dispatchEvent(event);
    };

    const handleLogoutClick = () => {
        logout();
        router.push(`/${sourceParam}`);
    };

    const handleChatClick = () => {
        const event = new CustomEvent('toggleChat');
        window.dispatchEvent(event);
    };

    return (
        <div className="fixed left-4 right-4 z-[9999] pointer-events-none"
            style={{
                bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                isolation: 'isolate'
            }}
        >
            <AnimatePresence mode="wait">
                {needsUpdate ? (
                    <motion.button
                        key="update-button"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        onClick={performUpdate}
                        className="w-full relative h-[60px] bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all group overflow-hidden border border-white/20 pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        <RefreshCw className="w-5 h-5 text-white animate-spin-slow group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-white font-bold text-sm">Обновить приложение</span>
                        <div className="absolute -inset-x-20 top-0 bottom-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </motion.button>
                ) : (
                    <motion.div
                        key="menu-content"
                        initial={{ y: 0, opacity: 1 }}
                        className="relative pointer-events-auto"
                        style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.22)",
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-xl"></div>

                        <div className="relative bg-gradient-to-r from-white/8 via-white/12 to-white/8 backdrop-blur-3xl border border-white/20 rounded-full px-6 py-4 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>

                            <div className={`relative max-w-md mx-auto flex items-center justify-between gap-2`}>
                                {!telegramId ? (
                                    <div className="flex flex-1 justify-evenly items-center">
                                        {/* Кнопка установки PWA (только если не в PWA) */}
                                        {!isStandalone && (
                                            <button
                                                onClick={handlePwaInstallClick}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/40 to-teal-600/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-teal-500/50 hover:to-teal-600/30 shadow-lg"
                                                aria-label="Установить приложение"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <PlusSquare className="relative w-6 h-6 text-teal-600 drop-shadow-sm" />
                                            </button>
                                        )}

                                        {/* Вход / Регистрация */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleLoginClick}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#2ba6e1]/40 to-[#2ba6e1]/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-[#2ba6e1]/50 hover:to-[#2ba6e1]/30 shadow-lg"
                                                aria-label="Войти"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <LogIn className="relative w-6 h-6 text-[#2ba6e1] drop-shadow-sm ml-0.5" />
                                            </button>

                                            <button
                                                onClick={handleChatClick}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/90 to-purple-700/80 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-purple-500/90 hover:to-purple-600/80 shadow-lg"
                                                aria-label="Открыть чат"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <MessageCircle className="relative w-6 h-6 text-white drop-shadow-sm" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-1 justify-between items-center px-2">
                                            {/* Мои устройства */}
                                            <button
                                                onClick={() => router.push('/my-devices')}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                                                aria-label="Мои устройства"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <DevicesIcon className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                                            </button>

                                            {/* Избранное */}
                                            <button
                                                onClick={() => router.push('/favorites')}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                                                aria-label="Избранное"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <Heart className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                                            </button>

                                            {/* Корзина */}
                                            <button
                                                onClick={() => router.push('/cart')}
                                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-white/50 hover:to-white/30 shadow-lg"
                                                aria-label="Корзина"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                <ShoppingCart className="relative w-6 h-6 text-gray-800 drop-shadow-sm" />
                                            </button>

                                            {/* Выход (только для клиентов) */}
                                            {!isAdminTelegramId(telegramId) && (
                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-red-500/40 hover:to-red-600/30 shadow-lg"
                                                    aria-label="Выйти"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                                                    <LogOut className="relative w-5 h-5 text-red-600 drop-shadow-sm" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Акцентная кнопка (Чат для юзеров или Админка для админов) */}
                                        {!isLoading && (
                                            isAdminTelegramId(telegramId) ? (
                                                <button
                                                    onClick={() => router.push('/admin')}
                                                    className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/90 to-purple-700/80 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-purple-500/90 hover:to-purple-600/80 shadow-lg ml-2"
                                                    aria-label="Открыть админ панель"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                    <Settings className="relative w-6 h-6 text-white drop-shadow-sm" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleChatClick}
                                                    className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/90 to-purple-700/80 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-purple-500/90 hover:to-purple-600/80 shadow-lg ml-2"
                                                    aria-label="Открыть чат"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                                    <MessageCircle className="relative w-6 h-6 text-white drop-shadow-sm" />
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MenuComponent