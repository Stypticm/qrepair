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
    const [contact, setContact] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!contact) {
            toast.error('Контакт для связи обязателен')
            return
        }

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
                    clientContact: contact,
                    clientAddress: address,
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
                <p className="text-sm text-muted">Выберите удобный способ передачи в сервис</p>
            </div>

            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setDeliveryMethod('self')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2 gap-2 h-32 ${deliveryMethod === 'self'
                            ? 'border-accent bg-accent/15 text-accent-deep'
                            : 'border-border bg-surface-elevated text-muted hover:border-accent/50'
                            }`}
                    >
                        <MapPin className={`w-8 h-8 ${deliveryMethod === 'self' ? 'text-accent-deep' : 'text-muted'}`} />
                        <span className="text-sm font-bold">Привезу сам</span>
                    </button>
                    <button
                        onClick={() => setDeliveryMethod('courier')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border-2 gap-2 h-32 ${deliveryMethod === 'courier'
                            ? 'border-accent bg-accent/15 text-accent-deep'
                            : 'border-border bg-surface-elevated text-muted hover:border-accent/50'
                            }`}
                    >
                        <Truck className={`w-8 h-8 ${deliveryMethod === 'courier' ? 'text-accent-deep' : 'text-muted'}`} />
                        <span className="text-sm font-bold">Вызвать курьера</span>
                    </button>
                </div>

                {deliveryMethod === 'self' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-surface rounded-2xl p-6 border border-border space-y-3"
                    >
                        <h3 className="font-bold text-foreground">Адрес сервисного центра</h3>
                        <p className="text-sm text-muted">ул. Примерная, д. 10, оф. 1</p>
                        <p className="text-sm text-muted">Ежедневно с 10:00 до 22:00</p>

                        <div className="bg-blue-50/50 rounded-xl p-3 flex gap-2 items-start mt-4">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                Вы можете приехать в любое удобное время. Заявка будет ожидать вас в системе.
                            </p>
                        </div>
                        
                        <div className="pt-2">
                            <input
                                type="text"
                                placeholder="Ваш телефон или Telegram для связи"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            placeholder="Ваш телефон или Telegram для связи"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted"
                        />
                        <input
                            type="text"
                            placeholder="Полный адрес (улица, дом, кв) для курьера"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted"
                        />
                        <div className="flex gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/20"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
                </Button>
            </div>
        </div>
    )
}
