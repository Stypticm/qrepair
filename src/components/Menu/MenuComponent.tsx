'use client'

import { Smartphone as DevicesIcon, Heart, ShoppingCart, Settings, Menu } from 'lucide-react';
import { isMaster } from '@/stores/authStore';

const MenuComponent = ({ userId, router, isLoading }: { userId: number, router: any, isLoading: boolean }) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="relative"
                style={{
                    // ещё более прозрачное стекло как в iOS
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    pointerEvents: "auto",
                }}
            >
                {/* Внешняя тень для глубины */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-xl"></div>

                {/* Основной контейнер с многослойностью */}
                <div className="relative bg-gradient-to-r from-white/8 via-white/12 to-white/8 backdrop-blur-3xl border border-white/20 rounded-full px-6 py-4 shadow-2xl">
                    {/* Внутренний градиент для объема */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full"></div>

                    {/* Контент меню */}
                    <div className={`relative max-w-md mx-auto flex ${!isLoading && isMaster(userId) ? 'justify-around' : 'justify-evenly'} items-center`}>
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

                        {/* Системная кнопка для админов */}
                        {!isLoading && isMaster(userId) && (
                            <button
                                onClick={() => router.push('/internal')}
                                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/90 to-purple-700/80 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-300 hover:from-purple-500/90 hover:to-purple-600/80 shadow-lg"
                                aria-label="Открыть админ панель"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                                <Settings className="relative w-6 h-6 text-white drop-shadow-sm" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MenuComponent