'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useAppStore } from '@/stores/authStore'

interface PickupPoint {
    id: number
    address: string
    name: string
    workingHours: string
}

export default function CheckoutPickupPage() {
    const router = useRouter()
    const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart()
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
    const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const { telegramId, username } = useAppStore(state => ({
        telegramId: state.telegramId,
        username: state.username
    }))

    // Загружаем точки приема
    useEffect(() => {
        const loadPickupPoints = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/points')
                if (response.ok) {
                    const data = await response.json()
                    setPickupPoints(Array.isArray(data.points) ? data.points : [])
                } else {
                    console.error('Ошибка загрузки точек приема:', response.status)
                    setPickupPoints([])
                }
            } catch (error) {
                console.error('Ошибка загрузки точек приема:', error)
                setPickupPoints([])
            } finally {
                setLoading(false)
            }
        }

        loadPickupPoints()
    }, [])

    const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

    const handleSubmit = async () => {
        if (!selectedPoint || submitting) return

        setSubmitting(true)
        try {
            const selectedPointData = pickupPoints.find(p => p.id === selectedPoint)

            // Создаем заказ
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryMethod: 'pickup',
                    pickupPointId: selectedPoint,
                    pickupAddress: selectedPointData?.address,
                    items: cartItems, // Отправляем товары из localStorage
                    telegramId: telegramId?.toString() // Передаем ID пользователя для связки с пушами
                }),
            })


            if (response.ok) {
                const { orderId } = await response.json()

                // Показываем загрузку и переходим
                setIsNavigating(true)

                // Очищаем корзину и переходим одновременно
                Promise.all([
                    clearCart(),
                    new Promise(resolve => setTimeout(resolve, 200))
                ]).then(() => {
                    router.push(`/cart/success?orderId=${orderId}`)
                })
            } else {
                const error = await response.json()
                console.error('Ошибка создания заказа:', error)
                alert('Ошибка при создании заказа. Попробуйте еще раз.')
            }
        } catch (error) {
            console.error('Ошибка при создании заказа:', error)
            alert('Ошибка при создании заказа. Попробуйте еще раз.')
        } finally {
            setSubmitting(false)
        }
    }

    // Редирект если корзина пуста (с задержкой для загрузки из localStorage)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (cartItems.length === 0) {
                console.log('Cart is empty on pickup page, redirecting to /cart')
                router.push('/cart')
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [cartItems.length, router])

    return (
        <>
            <Page back={true}>
                <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
                    <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4">
                            {/* Заголовок */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Наши точки приема
                                </h2>
                                <p className="text-gray-600">
                                    Выберите удобную для вас точку
                                </p>
                            </motion.div>

                            {/* Информация о заказе */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm w-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <span className="text-6xl">🛍️</span>
                                </div>
                                <div className="text-center space-y-2 relative z-10">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ваш заказ</p>
                                    <p className="text-2xl font-black text-gray-900">
                                        {getTotalItems()} товар{getTotalItems() === 1 ? '' : getTotalItems() < 5 ? 'а' : 'ов'}
                                    </p>
                                    <p className="text-lg font-bold text-teal-600">
                                        {formatPrice(getTotalPrice())}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Guest Notice - Apple Style */}
                            {(!telegramId || telegramId === 'guest_' || telegramId === 'browser_test_user') && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-5 flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                                        <span className="text-xl">🔔</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-blue-900">Будьте в курсе статуса</h4>
                                        <p className="text-xs text-blue-800/70 leading-relaxed">
                                            Войдите в аккаунт, чтобы получать мгновенные <b>Push-уведомления</b> об изменении статуса вашего заказа.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Точки самовывоза */}
                            <div className="space-y-4 flex-1 overflow-auto min-h-0 h-full w-full p-4 pb-20">
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : !Array.isArray(pickupPoints) || pickupPoints.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">
                                        Точки приема не найдены
                                    </div>
                                ) : (
                                    pickupPoints.map((point) => {
                                        const isSelected = selectedPoint === point.id
                                        return (
                                            <div
                                                key={point.id}
                                                className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${isSelected
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPoint(point.id)}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <span className="text-lg">📍</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-900">{point.name}</h3>
                                                                <p className="text-sm text-gray-600">{point.address}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm">🕒</span>
                                                                <span className="text-sm text-gray-600">Режим работы: {point.workingHours}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                                <div className="mx-3 self-stretch w-px bg-gray-200" aria-hidden />
                                                <Button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={!isSelected || submitting}
                                                    className={`flex items-center justify-center rounded-lg w-12 h-12 transition-colors ${isSelected ? 'bg-teal-500 text-white hover:bg-teal-600 animate-pulse' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    style={{ animationDuration: isSelected ? '0.8s' as any : undefined }}
                                                    aria-label="Оформить"
                                                    title={isSelected ? 'Оформить заказ' : 'Сначала выберите точку'}
                                                >
                                                    ➔
                                                </Button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Page>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Оформляем заказ…</p>
                    </div>
                </div>
            )}
        </>
    )
}
