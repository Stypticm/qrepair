'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Page } from '@/components/Page'
import { motion } from 'framer-motion'

interface Order {
    id: string
    totalPrice: number
    deliveryMethod: string
    pickupPoint?: {
        name: string
        address: string
        workingHours: string
    }
    deliveryAddress?: string
    items: Array<{
        title: string
        price: number
    }>
    userId: string
    createdAt: string
}

export default function SuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) {
            router.push('/cart')
            return
        }

        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`)
                if (response.ok) {
                    const data = await response.json()
                    setOrder(data.order)
                } else {
                    console.error('Ошибка загрузки заказа')
                }
            } catch (error) {
                console.error('Ошибка загрузки заказа:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId, router])

    const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

    if (loading) {
        return (
            <Page back={false}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Page>
        )
    }

    if (!order) {
        return (
            <Page back={false}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Заказ не найден</h3>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-[#2dc2c6] text-white rounded-xl hover:bg-[#25a8ac] transition-colors font-semibold"
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </Page>
        )
    }

    return (
        <Page back={false}>
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto pt-16 px-4 pb-32">
                    {/* Успешное оформление */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mb-8"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-12 h-12 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Заказ оформлен!</h1>
                        <p className="text-gray-600">Номер заказа: <span className="font-mono font-semibold">#{order.id.slice(0, 8)}</span></p>
                    </motion.div>

                    {/* Детали заказа */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Детали заказа</h2>

                        <div className="space-y-4">
                            {/* Товары */}
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Товары:</p>
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-gray-900">{item.title}</span>
                                            <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Итого */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Итого:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatPrice(order.totalPrice)}</span>
                                </div>
                            </div>

                            {/* Способ получения */}
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Способ получения:</p>
                                {order.deliveryMethod === 'pickup' && order.pickupPoint ? (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">🏪</span>
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.pickupPoint.name}</p>
                                                <p className="text-sm text-gray-600">{order.pickupPoint.address}</p>
                                                <p className="text-sm text-gray-600">🕒 {order.pickupPoint.workingHours}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-900">Курьерская доставка</p>
                                        {order.deliveryAddress && (
                                            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Оплата */}
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Способ оплаты:</p>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-gray-900">💵 Наличные или безналичные на месте</p>
                                    <p className="text-sm text-gray-600 mt-1">Оплата производится при получении товара</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Кнопки */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Guest nudge */}
                        {!order.userId.startsWith('guest_') ? null : (
                            <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-blue-100 text-center space-y-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900">Хотите получать уведомления?</h3>
                                    <p className="text-sm text-gray-500">Войдите через Telegram, чтобы мы могли прислать вам пуш-уведомление, когда заказ будет готов.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/?auth=true')}
                                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                                >
                                    Войти и получать пуши
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => router.push('/')}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                        >
                            Вернуться в магазин
                        </button>
                    </motion.div>
                </div>
            </div>
        </Page>
    )
}
