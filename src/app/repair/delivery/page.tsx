'use client'

import { useRouter } from 'next/navigation'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function RepairDeliveryPage() {
    const router = useRouter()
    const { telegramId } = useAppStore()
    const repairState = useRepairStore()
    const {
        deliveryMethod,
        setDeliveryMethod,
        contact,
        setContact,
        address,
        setAddress,
    } = repairState

    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleContactChange = (val: string) => {
        let clean = val;
        // Если пользователь начинает вводить никнейм буквами (любого регистра) и нет @ в начале
        if (clean.length > 0 && !clean.startsWith('@') && !clean.startsWith('+') && !/^\d/.test(clean)) {
            clean = '@' + clean;
        }
        setContact(clean);
    };

    const handleSubmit = async () => {
        if (!contact.trim()) {
            toast.error('Укажите контакт для связи (телефон или Telegram)')
            return
        }

        if (deliveryMethod === 'courier' && (!address.trim() || !date || !time)) {
            toast.error('Пожалуйста, заполните адрес, дату и время для курьера')
            return
        }

        setIsSubmitting(true)

        try {
            const finalCategory =
                repairState.selectedIssues.length > 0
                    ? repairState.selectedIssues.join(', ')
                    : repairState.category || 'Комплексный ремонт'

            const response = await fetch('/api/repair/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || '',
                },
                body: JSON.stringify({
                    deviceModel: repairState.deviceModel || 'iPhone',
                    category: finalCategory,
                    issueDescription: repairState.issueDescription,
                    issuePhotos: repairState.issuePhotos,
                    deliveryMethod,
                    appointmentDate: deliveryMethod === 'courier' ? date : undefined,
                    appointmentTime: deliveryMethod === 'courier' ? time : undefined,
                    courierNotes: deliveryMethod === 'courier' ? address : undefined,
                    clientContact: contact,
                    clientAddress: address,
                    estimatedMin: 3000,
                    estimatedMax: 9000,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                if (data.guestId && typeof window !== 'undefined') {
                    sessionStorage.setItem('telegramId', data.guestId)
                }
                if (data.id && typeof window !== 'undefined') {
                    localStorage.setItem('last_repair_request_id', data.id)
                    try {
                        const existing = JSON.parse(localStorage.getItem('qoqos_guest_repairs') || '[]')
                        const updated = Array.from(new Set([data.id, ...existing]))
                        localStorage.setItem('qoqos_guest_repairs', JSON.stringify(updated))
                    } catch (e) {
                        // ignore storage errors
                    }
                }
                repairState.reset()
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.removeItem('qoqos_repair_store')
                    } catch (e) {
                        // ignore storage errors
                    }
                }
                toast.success('Заявка успешно оформлена!')
                router.push(`/repair/status/${data.id}`)
            } else {
                toast.error(data.error || 'Ошибка при создании заявки')
            }
        } catch (e) {
            toast.error('Произошла ошибка при отправке заявки')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 pb-6 select-none">
            <div className="space-y-4">
                {/* Выбор способа доставки */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('self')}
                        className={cn(
                            'flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 gap-2 h-28 cursor-pointer active:scale-95',
                            deliveryMethod === 'self'
                                ? 'border-accent bg-accent/15 text-accent-deep dark:text-accent font-bold shadow-md ring-2 ring-accent/30'
                                : 'border-border bg-surface-elevated text-muted hover:border-accent/40'
                        )}
                    >
                        <MapPin className="w-7 h-7" />
                        <span className="text-sm font-bold">Привезу сам</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('courier')}
                        className={cn(
                            'flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 gap-2 h-28 cursor-pointer active:scale-95',
                            deliveryMethod === 'courier'
                                ? 'border-accent bg-accent/15 text-accent-deep dark:text-accent font-bold shadow-md ring-2 ring-accent/30'
                                : 'border-border bg-surface-elevated text-muted hover:border-accent/40'
                        )}
                    >
                        <Truck className="w-7 h-7" />
                        <span className="text-sm font-bold">Вызвать курьера</span>
                    </button>
                </div>

                {deliveryMethod === 'self' ? (
                    <div className="bg-surface-elevated rounded-2xl p-5 border border-border space-y-3.5">
                        <div className="space-y-1">
                            <h3 className="font-bold text-foreground text-sm">Адрес сервисного центра</h3>
                            <p className="text-xs text-muted">ул. Примерная, д. 10, оф. 1</p>
                            <p className="text-xs text-muted">Ежедневно с 10:00 до 22:00</p>
                        </div>

                        <div className="bg-blue-500/10 rounded-xl p-3 flex gap-2 items-start border border-blue-500/20">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                                Вы можете приехать в удобное время. Заявка с вашими данными уже будет ждать мастера.
                            </p>
                        </div>

                        <div className="pt-1">
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                Контакт для связи
                            </label>
                            <input
                                type="text"
                                placeholder="+7 (999) 000-00-00 или @username"
                                value={contact}
                                onChange={(e) => handleContactChange(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl p-5 border border-border space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                Контакт для связи
                            </label>
                            <input
                                type="text"
                                placeholder="+7 (999) 000-00-00 или @username"
                                value={contact}
                                onChange={(e) => handleContactChange(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                Адрес забора устройства
                            </label>
                            <input
                                type="text"
                                placeholder="Город, улица, дом, подъезд, квартира"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                    Дата
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full h-12 px-3 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                    Время
                                </label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full h-12 px-3 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопки навигации внизу */}
            <div className="flex gap-2.5 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/repair/estimate')}
                    className="flex-1 h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Назад
                </Button>
                <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex-[2] h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Оформление...
                        </>
                    ) : (
                        'Подтвердить'
                    )}
                </Button>
            </div>
        </div>
    )
}
