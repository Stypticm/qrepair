'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/authStore'
import { Loader2, Package, Truck, Hammer, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_STEPS = [
    { id: 'created', label: 'Заявка создана', icon: Clock },
    { id: 'courier_assigned', label: 'Курьер назначен', icon: Truck },
    { id: 'in_transit', label: 'В пути в СЦ', icon: Truck },
    { id: 'received', label: 'В сервисном центре', icon: Package },
    { id: 'diagnosing', label: 'Диагностика', icon: Loader2 },
    { id: 'price_approval', label: 'Согласование', icon: CheckCircle }, // <--- Добавили
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
            if (!id || !idParam) return

            const res = await fetch(`/api/repair/${idParam}`, {
                headers: { 'x-telegram-id': id.toString() }
            })

            if (res.ok) {
                const data = await res.json()
                setRequest(data.request)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        // Poll every 30s
        const interval = setInterval(fetchStatus, 30000)
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
            console.error(e)
        } finally {
            setApproving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="mt-4 text-sm text-gray-500">Загрузка статуса...</p>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <p className="text-gray-500">Заявка не найдена или у вас нет доступа.</p>
                <Button onClick={() => router.push('/repair')} variant="outline">На главную</Button>
            </div>
        )
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === request.status)
    // Fallback for cancelled or unpacked
    const displayIndex = currentStepIndex >= 0 ? currentStepIndex : 0

    return (
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mt-4 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Статус ремонта</h1>
                <p className="text-sm font-mono text-gray-500">#{request.id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span className="text-gray-500">Устройство</span>
                    <span className="font-bold">{request.deviceModel}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span className="text-gray-500">Проблема</span>
                    <span className="font-medium text-right">{request.category}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-500">Предварительная оценка</span>
                    <span className="font-bold text-blue-600">
                        {request.estimatedMin?.toLocaleString('ru')} – {request.estimatedMax?.toLocaleString('ru')} ₽
                    </span>
                </div>
                {request.clientPriceChoice && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-gray-500">Запчасти</span>
                        <span className="font-bold text-gray-900">
                            {request.clientPriceChoice === 'original' ? 'Оригинал' : 'Аналог'}
                        </span>
                    </div>
                )}
                {typeof request.finalPrice === 'number' && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Итоговая стоимость</span>
                        <span className="font-bold text-emerald-600">
                            {request.finalPrice.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                )}
                {request.returnMethod && (
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500">Способ возврата</span>
                        <span className="font-bold text-gray-900 text-right">
                            {request.returnMethod === 'self_pickup' ? 'Забрать в сервисе' : 'Доставка курьером'}
                        </span>
                    </div>
                )}
            </div>

            {request.status === 'price_approval' && !request.clientPriceChoice && (
                <div className="bg-orange-50 p-4 rounded-3xl border border-orange-200 mt-2 space-y-4">
                    <h4 className="font-bold text-orange-800 tracking-tight">Согласование стоимости ремонта</h4>
                    <p className="text-sm text-orange-700">Мастер провел диагностику. Пожалуйста, выберите вариант ремонта:</p>
                    
                    {request.masterNotes && (
                        <div className="bg-white p-3 rounded-xl text-sm text-gray-700 border border-orange-100 italic">
                            <b>Комментарий мастера:</b> {request.masterNotes}
                        </div>
                    )}

                    <div className="grid gap-3 pt-2">
                        <Button 
                            onClick={() => handleApprovePrice('original')}
                            disabled={approving}
                            className="w-full justify-between h-auto py-3 px-4 bg-white hover:bg-orange-100 text-gray-900 border-2 border-orange-200 shadow-sm rounded-xl transition-all"
                            variant="outline"
                        >
                            <span className="font-semibold text-left">Оригинальные запчасти</span>
                            <span className="font-bold text-orange-600">{request.priceOriginal?.toLocaleString('ru')} ₽</span>
                        </Button>
                        <Button 
                            onClick={() => handleApprovePrice('non_original')}
                            disabled={approving}
                            className="w-full justify-between h-auto py-3 px-4 bg-white hover:bg-orange-100 text-gray-900 border-2 border-orange-200 shadow-sm rounded-xl transition-all"
                            variant="outline"
                        >
                            <span className="font-semibold text-left">Неоригинальные (аналог)</span>
                            <span className="font-bold text-orange-600">{request.priceNonOriginal?.toLocaleString('ru')} ₽</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 tracking-tight">Отслеживание</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx < displayIndex
                        const isCurrent = idx === displayIndex
                        const isFuture = idx > displayIndex

                        return (
                            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 shrink-0 shadow bg-white
                  ${isCompleted ? 'border-green-500 text-green-500' : isCurrent ? 'border-blue-500 text-blue-600 drop-shadow-md' : 'border-gray-200 text-gray-300'}
                `}>
                                    <step.icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] pl-4 px-4 ${isCurrent ? 'opacity-100' : isFuture ? 'opacity-40' : 'opacity-80'}`}>
                                    <div className={`text-sm font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                                        {step.label}
                                    </div>
                                    {isCurrent && <div className="text-[10px] text-gray-400 mt-0.5">Текущий этап</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    onClick={() => router.push('/catalog')}
                    className="w-full h-14 rounded-2xl font-bold border-2 border-gray-200 hover:border-blue-100 bg-white/80 backdrop-blur-md hover:bg-blue-50 text-gray-700 transition-all active:scale-[0.98]"
                >
                    Вернуться в каталог
                </Button>
            </div>
        </div>
    )
}
