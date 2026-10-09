'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/stores/authStore'
import { Loader2, Package, Truck, Hammer, CheckCircle, Clock, Smartphone, Wrench, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_STEPS = [
    { id: 'created', label: 'Заявка создана', icon: Clock },
    { id: 'courier_assigned', label: 'Курьер назначен', icon: Truck },
    { id: 'in_transit', label: 'В пути в СЦ', icon: Truck },
    { id: 'received', label: 'В сервисном центре', icon: Package },
    { id: 'diagnosing', label: 'Диагностика', icon: Loader2 },
    { id: 'price_approval', label: 'Согласование', icon: CheckCircle },
    { id: 'repairing', label: 'В ремонте', icon: Hammer },
    { id: 'ready_for_pickup', label: 'Готово к выдаче', icon: CheckCircle },
    { id: 'delivered', label: 'Выдано клиенту', icon: CheckCircle },
]

export default function RepairStatusPage() {
    const router = useRouter()
    const params = useParams()
    const idParam = params?.id as string
    const { telegramId } = useAppStore()
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)

    const fetchStatus = async () => {
        try {
            const id = telegramId || sessionStorage.getItem('telegramId')
            if (!idParam) return

            const res = await fetch(`/api/repair/${idParam}`, {
                headers: id ? { 'x-telegram-id': id.toString() } : {}
            })

            if (res.ok) {
                const data = await res.json()
                setRequest(data.request)
            }
        } catch (e) {
            console.error('Error fetching repair status:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 20000)
        return () => clearInterval(interval)
    }, [idParam, telegramId])

    const handleApprovePrice = async (choice: 'original' | 'non_original') => {
        setApproving(true)
        try {
            const id = telegramId || sessionStorage.getItem('telegramId')
            const res = await fetch(`/api/repair/${idParam}/approve-price`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-telegram-id': id?.toString() || '' 
                },
                body: JSON.stringify({ choice })
            })
            if (res.ok) {
                const data = await res.json()
                setRequest(data.request)
            }
        } catch (e) {
            console.error('Error approving price:', e)
        } finally {
            setApproving(false)
        }
    }



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-9 h-9 animate-spin text-accent" />
                <p className="text-sm font-medium text-muted">Загрузка информации о заявке...</p>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
                <p className="text-sm text-muted">Заявка не найдена или еще обрабатывается.</p>
                <Button onClick={() => router.push('/')} variant="outline" className="rounded-2xl font-bold">
                    На главную
                </Button>
            </div>
        )
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === request.status)
    const displayIndex = currentStepIndex >= 0 ? currentStepIndex : 0

    return (
        <div
            className="space-y-6 pb-40 w-full touch-pan-y"
            style={{ paddingTop: 'max(36px, calc(env(safe-area-inset-top) + 16px))' }}
        >
            {/* Заголовок */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Статус ремонта
                </h1>
                <p className="text-xs font-mono font-bold text-accent-deep dark:text-accent select-all">
                    #{request.id.slice(-6).toUpperCase()}
                </p>
            </div>

            {/* Карточка данных заявки */}
            <div className="bg-surface-elevated p-5 rounded-3xl border border-border shadow-sm space-y-3.5">
                <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-accent" />
                        Устройство
                    </span>
                    <span className="text-sm font-bold text-foreground truncate max-w-[60%] text-right">
                        {request.deviceModel}
                    </span>
                </div>

                <div className="flex justify-between items-start pb-3 border-b border-border/60 gap-3">
                    <span className="text-xs text-muted font-medium flex items-center gap-1.5 shrink-0">
                        <Wrench className="w-4 h-4 text-accent" />
                        Поломка
                    </span>
                    <span className="text-xs font-bold text-foreground text-right leading-relaxed">
                        {request.category}
                    </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        Предварительно
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {request.estimatedMin ? `${request.estimatedMin.toLocaleString('ru')} – ${request.estimatedMax?.toLocaleString('ru')} ₽` : 'На диагностике'}
                    </span>
                </div>

                {request.clientPriceChoice && (
                    <div className="flex justify-between items-center pb-3 border-b border-border/60">
                        <span className="text-xs text-muted font-medium">Запчасти</span>
                        <span className="text-xs font-bold text-foreground">
                            {request.clientPriceChoice === 'original' ? 'Оригинальные' : 'Аналог'}
                        </span>
                    </div>
                )}

                {typeof request.finalPrice === 'number' && (
                    <div className="flex justify-between items-center py-2 border-b border-border/60">
                        <span className="text-xs text-muted font-medium">Итоговая сумма</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            {request.finalPrice.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-muted font-medium">Способ</span>
                    <span className="text-xs font-bold text-foreground">
                        {request.deliveryMethod === 'courier' ? 'Доставка курьером 🚚' : 'Привезу в сервис 🏪'}
                    </span>
                </div>
            </div>

            {/* Согласование цены мастером (если статус price_approval) */}
            {request.status === 'price_approval' && !request.clientPriceChoice && (
                <div className="bg-amber-500/10 p-5 rounded-3xl border border-amber-500/25 space-y-4">
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 tracking-tight">
                        Согласование стоимости ремонта
                    </h4>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                        Мастер провел осмотр и готов к ремонту. Пожалуйста, выберите подходящий вариант запчастей:
                    </p>
                    
                    {request.masterNotes && (
                        <div className="bg-surface p-3 rounded-xl text-xs text-foreground border border-border italic">
                            <b>Комментарий мастера:</b> {request.masterNotes}
                        </div>
                    )}

                    <div className="grid gap-2.5 pt-1">
                        <Button 
                            onClick={() => handleApprovePrice('original')}
                            disabled={approving}
                            className="w-full justify-between h-auto py-3 px-4 bg-surface-elevated hover:bg-surface text-foreground border-2 border-border shadow-sm rounded-2xl transition-all cursor-pointer"
                            variant="outline"
                        >
                            <span className="font-bold text-xs text-left">Оригинальные запчасти</span>
                            <span className="font-black text-sm text-accent-deep dark:text-accent">
                                {request.priceOriginal?.toLocaleString('ru')} ₽
                            </span>
                        </Button>
                        <Button 
                            onClick={() => handleApprovePrice('non_original')}
                            disabled={approving}
                            className="w-full justify-between h-auto py-3 px-4 bg-surface-elevated hover:bg-surface text-foreground border-2 border-border shadow-sm rounded-2xl transition-all cursor-pointer"
                            variant="outline"
                        >
                            <span className="font-bold text-xs text-left">Аналог (высокое качество)</span>
                            <span className="font-black text-sm text-accent-deep dark:text-accent">
                                {request.priceNonOriginal?.toLocaleString('ru')} ₽
                            </span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Блок отслеживания этапов */}
            <div className="bg-surface-elevated p-6 rounded-3xl border border-border shadow-sm">
                <h3 className="font-black text-foreground mb-6 text-sm uppercase tracking-wider">
                    Этапы выполнения
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-[15px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent/40 before:via-border before:to-transparent">
                    {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx < displayIndex
                        const isCurrent = idx === displayIndex
                        const isFuture = idx > displayIndex

                        return (
                            <div key={step.id} className="relative flex items-center gap-4">
                                <div className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 transition-all',
                                    isCompleted
                                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : isCurrent
                                        ? 'border-accent bg-accent text-primary-foreground shadow-md ring-4 ring-accent/20'
                                        : 'border-border bg-surface text-muted/40'
                                )}>
                                    <step.icon className={cn('w-4 h-4', isCurrent && 'animate-spin')} />
                                </div>
                                <div className={cn(
                                    'flex-1 min-w-0 transition-opacity',
                                    isCurrent ? 'opacity-100 font-black' : isFuture ? 'opacity-35' : 'opacity-85'
                                )}>
                                    <div className={cn(
                                        'text-xs font-bold leading-tight',
                                        isCurrent ? 'text-accent-deep dark:text-accent' : 'text-foreground'
                                    )}>
                                        {step.label}
                                    </div>
                                    {isCurrent && (
                                        <div className="text-[10px] text-muted mt-0.5 font-medium">Текущий этап</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Кнопка "На главную" */}
            <div className="pt-2 pb-6">
                <Button
                    onClick={() => router.push('/')}
                    className="w-full h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all cursor-pointer active:scale-[0.98]"
                >
                    На главную
                </Button>
            </div>
        </div>
    )
}
