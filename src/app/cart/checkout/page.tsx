'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

// iPhone-специфичные размеры экранов
const IPHONE_BREAKPOINTS = {
    mini: { width: 375, height: 812 },
    standard: { width: 390, height: 844 },
    plus: { width: 428, height: 926 },
    pro: { width: 393, height: 852 },
} as const

const getIPhoneScreenSize = () => {
    if (typeof window === 'undefined') return 'standard'
    const { innerWidth } = window
    if (innerWidth <= 375) return 'mini'
    if (innerWidth <= 390) return 'standard'
    if (innerWidth <= 393) return 'pro'
    return 'plus'
}

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, getTotalPrice, getTotalItems } = useCart()
    const [selectedOption, setSelectedOption] = useState<'pickup' | 'courier' | null>(null)
    const [isNavigating, setIsNavigating] = useState(false)
    const [screenSize, setScreenSize] = useState<'mini' | 'standard' | 'pro' | 'plus'>('standard')

    useEffect(() => {
        if (typeof window === 'undefined') return
        const updateScreenSize = () => setScreenSize(getIPhoneScreenSize())
        updateScreenSize()
        window.addEventListener('resize', updateScreenSize)
        return () => window.removeEventListener('resize', updateScreenSize)
    }, [])

    // Редирект если корзина пуста (с задержкой для загрузки из localStorage)
    useEffect(() => {
        // Даем время на загрузку корзины из localStorage
        const timer = setTimeout(() => {
            if (cartItems.length === 0) {
                console.log('Cart is empty, redirecting to /cart')
                router.push('/cart')
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [cartItems.length, router])

    // Адаптивные размеры
    const adaptiveStyles = useMemo(() => {
        const baseStyles = {
            buttonHeight: 'h-20',
            iconSize: 'w-12 h-12',
            textSize: 'text-base',
            subTextSize: 'text-sm',
            spacing: 'space-x-5',
            gap: 'gap-4'
        }

        switch (screenSize) {
            case 'mini':
                return { ...baseStyles, buttonHeight: 'h-18', iconSize: 'w-10 h-10', textSize: 'text-base', subTextSize: 'text-xs', gap: 'gap-3' }
            case 'plus':
                return { ...baseStyles, buttonHeight: 'h-22', iconSize: 'w-14 h-14', textSize: 'text-lg', subTextSize: 'text-sm', spacing: 'space-x-6', gap: 'gap-5' }
            default:
                return baseStyles
        }
    }, [screenSize])

    const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

    const handlePickup = () => {
        setSelectedOption('pickup')
        setIsNavigating(true)
        setTimeout(() => router.push('/cart/checkout/pickup'), 200)
    }

    const handleCourier = () => {
        setSelectedOption('courier')
        setIsNavigating(true)
        // Пока редирект на pickup, позже создадим courier
        setTimeout(() => router.push('/cart/checkout/pickup'), 200)
    }

    // Показываем загрузку если корзина пуста (редирект в useEffect)
    if (cartItems.length === 0) {
        return (
            <Page back={true}>
                <div className="w-full h-screen flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Page>
        )
    }

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
                        {/* Заголовок */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Способ получения
                            </h2>
                            <p className="text-gray-600">
                                Выберите удобный способ получения товаров
                            </p>
                        </motion.div>

                        {/* Информация о заказе */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm w-full"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-base text-gray-700">Ваш заказ:</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {getTotalItems()} товар{getTotalItems() === 1 ? '' : getTotalItems() < 5 ? 'а' : 'ов'}
                                </p>
                                <p className="text-lg text-gray-700">
                                    Сумма: <span className="font-semibold text-green-600">{formatPrice(getTotalPrice())}</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Кнопки выбора способа доставки */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={`w-full flex flex-col ${adaptiveStyles.gap}`}
                        >
                            {/* Самовывоз */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                            >
                                <Button
                                    onClick={handlePickup}
                                    className={`w-full ${adaptiveStyles.buttonHeight} bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-3xl font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 overflow-hidden relative group`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-3xl" />

                                    <div className={`flex items-center justify-center ${adaptiveStyles.spacing} relative z-10`}>
                                        <div className={`${adaptiveStyles.iconSize} bg-gray-100 rounded-2xl flex items-center justify-center mr-1`}>
                                            <span className={`${screenSize === 'plus' ? 'text-3xl' : screenSize === 'mini' ? 'text-xl' : 'text-2xl'}`}>🏪</span>
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-bold ${adaptiveStyles.textSize}`}>Самовывоз</div>
                                            <div className={`${adaptiveStyles.subTextSize} opacity-70 font-medium`}>Заберу сам из точки</div>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </Button>
                            </motion.div>

                            {/* Курьер (временно disabled) */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative opacity-50"
                            >
                                <Button
                                    disabled
                                    className={`w-full ${adaptiveStyles.buttonHeight} bg-white text-gray-400 rounded-3xl font-semibold shadow-xl border-2 border-gray-200 overflow-hidden relative cursor-not-allowed`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-3xl" />

                                    <div className={`flex items-center justify-center ${adaptiveStyles.spacing} relative z-10`}>
                                        <div className={`${adaptiveStyles.iconSize} bg-gray-100 rounded-2xl flex items-center justify-center mr-1`}>
                                            <span className={`${screenSize === 'plus' ? 'text-3xl' : screenSize === 'mini' ? 'text-xl' : 'text-2xl'}`}>🚚</span>
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-bold ${adaptiveStyles.textSize}`}>Курьер</div>
                                            <div className={`${adaptiveStyles.subTextSize} opacity-70 font-medium`}>Скоро доступно</div>
                                        </div>
                                    </div>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">
                            {selectedOption === 'courier' ? 'Настраиваем курьера…' : 'Открываем точки самовывоза…'}
                        </p>
                    </div>
                </div>
            )}
        </Page>
    )
}
