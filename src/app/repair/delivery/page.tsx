'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'

export default function RepairDeliveryPage() {
    const router = useRouter()
    const { telegramId } = useAppStore()
    const repairState = useRepairStore()
    const { deliveryMethod, setDeliveryMethod } = repairState

    const [address, setAddress] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (deliveryMethod === 'courier' && (!address || !date || !time)) {
            toast.error('Пожалуйста, заполните все поля для курьера')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/repair/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || '',
                },
                body: JSON.stringify({
                    deviceModel: repairState.deviceModel,
                    category: repairState.category,
                    issueDescription: repairState.issueDescription,
                    issuePhotos: repairState.issuePhotos,
                    deliveryMethod,
                    appointmentDate: deliveryMethod === 'courier' ? date : undefined,
                    appointmentTime: deliveryMethod === 'courier' ? time : undefined,
                    courierNotes: deliveryMethod === 'courier' ? address : undefined,
                    estimatedMin: repairState.category === 'Разбито стекло / экран' ? 4500 : 2500,
                    estimatedMax: repairState.category === 'Разбито стекло / экран' ? 12000 : 8000,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                repairState.reset()
                toast.success('Заявка успешно оформлена!')
                router.push(`/repair/status/${data.id}`)
            } else {
                toast.error(data.error || 'Ошибка при создании заявки')
            }
        } catch (e) {
            toast.error('Произошла ошибка при отправке')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">Выберите удобный способ передачи в сервис</p>
            </div>

            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setDeliveryMethod('self')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2 gap-2 h-32 ${deliveryMethod === 'self'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                            }`}
                    >
                        <MapPin className={`w-8 h-8 ${deliveryMethod === 'self' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-bold">Привезу сам</span>
                    </button>
                    <button
                        onClick={() => setDeliveryMethod('courier')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2 gap-2 h-32 ${deliveryMethod === 'courier'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                            }`}
                    >
                        <Truck className={`w-8 h-8 ${deliveryMethod === 'courier' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-bold">Вызвать курьера</span>
                    </button>
                </div>

                {deliveryMethod === 'self' ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-3"
                    >
                        <h3 className="font-bold text-gray-900">Адрес сервисного центра</h3>
                        <p className="text-sm text-gray-600">ул. Примерная, д. 10, оф. 1</p>
                        <p className="text-sm text-gray-600">Ежедневно с 10:00 до 22:00</p>

                        <div className="bg-blue-50/50 rounded-xl p-3 flex gap-2 items-start mt-4">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                Вы можете приехать в любое удобное время. Заявка будет ожидать вас в системе.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            placeholder="Полный адрес (улица, дом, кв)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
                </Button>
            </div>
        </div>
    )
}
