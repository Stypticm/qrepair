'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { Loader2, Truck } from 'lucide-react'

export default function CheckoutCourierPage() {
    const router = useRouter()
    const { cartItems, getTotalPrice, clearCart } = useCart()
    const { telegramId } = useAppStore()

    const [address, setAddress] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Если корзина пуста, редиректим (защита от прямого захода)
    useEffect(() => {
        if (cartItems.length === 0 && !isSubmitting && !isSuccess) {
            if (typeof window !== 'undefined') {
                router.replace('/cart')
            }
        }
    }, [cartItems.length, isSubmitting, isSuccess, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!address || !name || !phone) {
            toast.error('Пожалуйста, заполните все поля')
            return
        }

        setIsSubmitting(true)

        try {
            const id = telegramId || sessionStorage.getItem('telegramId')

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': id?.toString() || '',
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        price: Number(item.price),
                    })),
                    totalAmount: getTotalPrice(),
                    deliveryMethod: 'courier',
                    customerName: name,
                    customerPhone: phone,
                    deliveryAddress: address,
                    // Дату и время не просим у клиента — согласуем отдельно
                }),
            })

            const data = await response.json()

            if (response.ok) {
                clearCart()
                setIsSuccess(true)
                setTimeout(() => {
                    router.replace('/')
                }, 3000)
            } else {
                toast.error(data.error || 'Произошла ошибка при оформлении')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error('Произошла ошибка при соединении с сервером')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Page back={true}>
            <div className="w-full min-h-screen bg-[#f8f9fa] pt-4 pb-24 px-4 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-2 mb-6"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Адрес и время</h2>
                        <p className="text-sm text-gray-500">
                            Курьер доставит ваш заказ точно в срок
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Контактные данные</h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase ml-1">Имя получателя</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Иван Иванов"
                                    className="w-full px-4 h-12 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase ml-1">Телефон</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+7 (999) 000-00-00"
                                    className="w-full px-4 h-12 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Куда доставить?</h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase ml-1">Полный адрес</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Город, улица, дом, квартира/офис, подъезд"
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-900 resize-none"
                                />
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Дату и время доставки мы уточним с вами после оформления заказа.
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 text-lg transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    `Оформить за ${getTotalPrice().toLocaleString('ru-RU')} ₽`
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            {isSuccess && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center text-center px-6">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <span className="text-2xl">✅</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Заказ оформлен</p>
                        <p className="mt-2 text-sm text-gray-500">Через пару секунд вы будете перенаправлены на главную страницу.</p>
                    </div>
                </div>
            )}
        </Page>
    )
}
