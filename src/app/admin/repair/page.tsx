'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Smartphone, MapPin, Truck } from 'lucide-react'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminRepairPage() {
    const router = useRouter()
    const { telegramId } = useAppStore()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [priceDraftOriginal, setPriceDraftOriginal] = useState<Record<string, string>>({})
    const [priceDraftNonOriginal, setPriceDraftNonOriginal] = useState<Record<string, string>>({})
    const [priceNotified, setPriceNotified] = useState<Record<string, boolean>>({})
    const [masterNotes, setMasterNotes] = useState<Record<string, string>>({})
    
    // Стейт модалки для выбора способа возврата
    const [returnMethodModal, setReturnMethodModal] = useState<{ isOpen: boolean; requestId: string | null }>({ isOpen: false, requestId: null })

    useEffect(() => {
        fetchRequests()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [telegramId])

    const fetchRequests = async () => {
        try {
            const id = telegramId || sessionStorage.getItem('telegramId')
            if (!id) return

            const res = await fetch('/api/repair/list', {
                headers: { 'x-telegram-id': id.toString() }
            })

            if (res.ok) {
                const data = await res.json()
                setRequests(data.requests)
            } else {
                toast.error('Ошибка загрузки заявок')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string, additionalData: any = {}) => {
        try {
            const tid = telegramId || sessionStorage.getItem('telegramId')
            const res = await fetch(`/api/repair/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': tid?.toString() || ''
                },
                body: JSON.stringify({ status: newStatus, ...additionalData })
            })

            if (res.ok) {
                toast.success('Успешно обновлено')
                fetchRequests() // Refresh list
                if (newStatus === 'ready_for_pickup') {
                    setReturnMethodModal({ isOpen: false, requestId: null })
                }
            } else {
                toast.error('Не удалось обновить')
            }
        } catch (e) {
            console.error(e)
            toast.error('Ошибка сети')
        }
    }

    const takeJob = async (id: string) => {
        try {
            const tid = telegramId || sessionStorage.getItem('telegramId')
            const res = await fetch(`/api/repair/${id}/take`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': tid?.toString() || ''
                }
            })

            if (res.ok) {
                toast.success('Заявка взята в работу')
                fetchRequests()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Ошибка при взятии заявки')
            }
        } catch(e) {
            console.error(e)
            toast.error('Ошибка сети')
        }
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            created: { label: 'Новая', color: 'bg-blue-100 text-blue-800' },
            courier_assigned: { label: 'Курьер назначен', color: 'bg-indigo-100 text-indigo-800' },
            in_transit: { label: 'В пути в СЦ', color: 'bg-indigo-100 text-indigo-800' },
            received: { label: 'В СЦ', color: 'bg-purple-100 text-purple-800' },
            diagnosing: { label: 'Диагностика', color: 'bg-amber-100 text-amber-800' },
            price_approval: { label: 'Согласование цены', color: 'bg-orange-100 text-orange-800' },
            repairing: { label: 'В ремонте', color: 'bg-yellow-100 text-yellow-800' },
            ready_for_pickup: { label: 'Готово к выдаче', color: 'bg-green-100 text-green-800' },
            delivered: { label: 'Выдано', color: 'bg-gray-100 text-gray-800' },
            cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-800' }
        }
        const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
        return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${mapped.color}`}>{mapped.label}</span>
    }

    const canSetStatus = (current: string, target: string) => {
        if (current === target) return false

        // Линейный сценарий для мастера внутри сервиса
        switch (target) {
            case 'received':
                return ['created', 'courier_assigned', 'in_transit'].includes(current)
            case 'diagnosing':
                return current === 'received'
            case 'price_approval':
                return current === 'diagnosing'
            case 'repairing':
                return current === 'price_approval'
            case 'ready_for_pickup':
                return current === 'repairing'
            case 'delivered':
                return current === 'ready_for_pickup'
            default:
                return false
        }
    }

    const statusButtonClass = (current: string, target: string, accent?: 'green' | 'final') => {
        const isActive = current === target
        const enabled = canSetStatus(current, target)

        if (!enabled) {
            return 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
        }

        if (isActive) {
            if (accent === 'green') {
                return 'bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-emerald-100 cursor-pointer hover:bg-emerald-600 active:scale-95 transition-colors'
            }
            if (accent === 'final') {
                return 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-gray-200 cursor-pointer hover:bg-black active:scale-95 transition-colors'
            }
            return 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100 cursor-pointer hover:bg-blue-700 active:scale-95 transition-colors'
        }

        // enabled, not active
        if (accent === 'green') {
            return 'border-emerald-300 text-emerald-700 bg-emerald-50 cursor-pointer hover:bg-emerald-100 active:scale-95 transition-colors'
        }
        if (accent === 'final') {
            return 'border-gray-300 text-gray-700 bg-gray-50 cursor-pointer hover:bg-gray-100 active:scale-95 transition-colors'
        }
        return 'border-gray-200 text-gray-700 bg-blue-50 cursor-pointer hover:bg-blue-100 active:scale-95 transition-colors'
    }

    const handleSavePriceAndNotify = async (id: string, req: any) => {
        const rawOrig = priceDraftOriginal[id] ?? (req.priceOriginal != null ? req.priceOriginal.toString() : '')
        const rawNonOrig = priceDraftNonOriginal[id] ?? (req.priceNonOriginal != null ? req.priceNonOriginal.toString() : '')
        
        const valOrig = rawOrig ? Number(rawOrig) : NaN
        const valNonOrig = rawNonOrig ? Number(rawNonOrig) : NaN

        if (Number.isNaN(valOrig) || valOrig <= 0 || Number.isNaN(valNonOrig) || valNonOrig <= 0) {
            toast.error('Укажите обе стоимости корректно')
            return
        }

        try {
            const tid = telegramId || sessionStorage.getItem('telegramId')
            const res = await fetch(`/api/repair/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': tid?.toString() || '',
                },
                body: JSON.stringify({ 
                    priceOriginal: valOrig,
                    priceNonOriginal: valNonOrig,
                    masterNotes: masterNotes[id] || req.masterNotes || '',
                    status: 'price_approval' // Сразу переводим в статус ожидания ответа
                }),
            })

            if (res.ok) {
                toast.success('Отправлено клиенту на согласование')
                setPriceNotified(prev => ({ ...prev, [id]: true }))
                fetchRequests()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Не удалось отправить')
            }
        } catch (e) {
            toast.error('Ошибка сети при отправке')
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-24 pb-12 overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-6 w-full">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        className="w-10 h-10 p-0 rounded-full hover:bg-gray-200"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Заявки на ремонт</h1>
                    <Button
                        variant="outline"
                        className="ml-auto flex items-center gap-2"
                        onClick={fetchRequests}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Заявок пока нет</h3>
                        <p className="text-gray-500 mt-1">Новые заявки появятся здесь.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map(req => (
                            <Card key={req.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <CardTitle className="text-xl font-bold">{req.deviceModel}</CardTitle>
                                                {getStatusBadge(req.status)}
                                                {!req.assignedMasterId && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="default"
                                                        onClick={() => takeJob(req.id)}
                                                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        Взять в работу
                                                    </Button>
                                                )}
                                                {req.assignedMasterId && (
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md border border-gray-300">
                                                        Мастер назначен
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 font-mono">#{req.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">{req.category}</div>
                                            <div className="text-xs text-gray-500 mt-1">Создана: {new Date(req.createdAt).toLocaleString('ru')}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {req.issueDescription && (
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Описание</div>
                                                    <p className="text-sm text-gray-700">{req.issueDescription}</p>
                                                </div>
                                            )}
                                            {(req.clientContact || req.clientAddress) && (
                                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Клиент</div>
                                                    {req.clientContact && (
                                                        <div className="text-sm text-gray-700 mb-1">
                                                            <span className="text-gray-500 mr-2">Контакт:</span>
                                                            <span className="font-semibold">{req.clientContact}</span>
                                                        </div>
                                                    )}
                                                    {req.clientAddress && (
                                                        <div className="text-sm text-gray-700">
                                                            <span className="text-gray-500 mr-2">Адрес:</span>
                                                            <span>{req.clientAddress}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Логистика (при заборе)</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {req.deliveryMethod === 'courier' ? (
                                                        <>
                                                            <Truck className="w-4 h-4 text-orange-500" />
                                                            <span>Курьерская: {req.appointmentDate && new Date(req.appointmentDate).toISOString().split('T')[0]} в {req.appointmentTime}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-4 h-4 text-blue-500" />
                                                            <span>Привезет клиент (самовывоз)</span>
                                                        </>
                                                    )}
                                                </div>
                                                {req.courierNotes && (
                                                    <div className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded">
                                                        <b>Доп. инфо курьера/адрес:</b> {req.courierNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Действия / Смена статуса</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* В СЦ */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'received'))}
                                                        disabled={!canSetStatus(req.status, 'received')}
                                                        onClick={() => updateStatus(req.id, 'received')}
                                                    >
                                                        В СЦ
                                                    </Button>

                                                    {/* Диагностика */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'diagnosing'))}
                                                        disabled={!canSetStatus(req.status, 'diagnosing')}
                                                        onClick={() => updateStatus(req.id, 'diagnosing')}
                                                    >
                                                        Диагностика
                                                    </Button>

                                                    {/* Согласование цены (через форму ниже, кнопку тут отключаем или делаем просто статусом) */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'price_approval'))}
                                                        disabled={true} // Переход в согласование только при отправке цен
                                                    >
                                                        Согласование
                                                    </Button>

                                                    {/* В ремонте */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'repairing'))}
                                                        disabled={!canSetStatus(req.status, 'repairing')}
                                                        onClick={() => updateStatus(req.id, 'repairing')}
                                                    >
                                                        В ремонте
                                                    </Button>

                                                    {/* Готово к выдаче - открываем модалку */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'ready_for_pickup', 'green'))}
                                                        disabled={!canSetStatus(req.status, 'ready_for_pickup')}
                                                        onClick={() => setReturnMethodModal({ isOpen: true, requestId: req.id })}
                                                    >
                                                        Готово к выдаче
                                                    </Button>

                                                    {/* Завершить (Выдано) — только после ready_for_pickup */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(statusButtonClass(req.status, 'delivered', 'final'))}
                                                        disabled={!canSetStatus(req.status, 'delivered')}
                                                        onClick={() => updateStatus(req.id, 'delivered')}
                                                    >
                                                        Завершить (Выдано)
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Оценка ремонта</div>
                                                
                                                {/* Инфо от клиента */}
                                                {req.clientPriceChoice && (
                                                    <div className="mb-4 bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col gap-1">
                                                        <div className="text-sm font-semibold text-green-800">Клиент подтвердил цену!</div>
                                                        <div className="text-xs text-green-700">Выбор: <b>{req.clientPriceChoice === 'original' ? 'Оригинал' : 'Неоригинал'}</b></div>
                                                        <div className="text-xs text-green-700">Итоговая сумма: <b>{req.finalPrice?.toLocaleString('ru-RU')} ₽</b></div>
                                                    </div>
                                                )}

                                                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Оригинал</label>
                                                            <input
                                                                type="number"
                                                                value={priceDraftOriginal[req.id] ?? (req.priceOriginal != null ? req.priceOriginal.toString() : '')}
                                                                onChange={(e) => setPriceDraftOriginal(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                                disabled={req.status === 'price_approval' || req.clientPriceChoice}
                                                                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                                                placeholder="Цена"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Неоригинал</label>
                                                            <input
                                                                type="number"
                                                                value={priceDraftNonOriginal[req.id] ?? (req.priceNonOriginal != null ? req.priceNonOriginal.toString() : '')}
                                                                onChange={(e) => setPriceDraftNonOriginal(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                                disabled={req.status === 'price_approval' || req.clientPriceChoice}
                                                                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                                                placeholder="Цена"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Заметки для клиента</label>
                                                        <textarea 
                                                            value={masterNotes[req.id] ?? (req.masterNotes || '')}
                                                            onChange={(e) => setMasterNotes(prev => ({...prev, [req.id]: e.target.value}))}
                                                            disabled={req.status === 'price_approval' || req.clientPriceChoice}
                                                            className="w-full h-16 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                                                            placeholder="Что сломалось, что будем чинить..."
                                                        />
                                                    </div>

                                                    {!req.clientPriceChoice && req.status !== 'price_approval' && (
                                                        <Button
                                                            size="sm"
                                                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                            onClick={() => handleSavePriceAndNotify(req.id, req)}
                                                        >
                                                            Отправить 2 цены клиенту на выбор
                                                        </Button>
                                                    )}
                                                    {req.status === 'price_approval' && !req.clientPriceChoice && (
                                                        <div className="text-sm text-orange-600 font-semibold text-center w-full py-2 bg-orange-50 rounded-lg">
                                                            Ожидаем решение клиента
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Модалка для выбора способа возврата */}
            {returnMethodModal.isOpen && returnMethodModal.requestId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Способ возврата</h3>
                        <p className="text-sm text-gray-500 mb-6">Как клиент получит устройство?</p>
                        
                        <div className="space-y-3">
                            <button 
                                className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 bg-blue-50 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                                onClick={() => updateStatus(returnMethodModal.requestId!, 'ready_for_pickup', { returnMethod: 'self_pickup' })}
                            >
                                🏪 Заберут в сервисе
                            </button>
                            <button 
                                className="w-full flex items-center justify-center gap-2 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                                onClick={() => updateStatus(returnMethodModal.requestId!, 'ready_for_pickup', { returnMethod: 'courier_return' })}
                            >
                                🚚 Отправить курьером
                            </button>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Button 
                                variant="ghost" 
                                className="w-full text-gray-500 hover:text-gray-900"
                                onClick={() => setReturnMethodModal({ isOpen: false, requestId: null })}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
