'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Smartphone, MapPin, Truck, X, User } from 'lucide-react'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminRepairPage() {
    const router = useRouter()
    const { telegramId } = useAppStore()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [priceDraftOriginal, setPriceDraftOriginal] = useState<Record<string, string>>({})
    const [priceDraftNonOriginal, setPriceDraftNonOriginal] = useState<Record<string, string>>({})
    const [priceNotified, setPriceNotified] = useState<Record<string, boolean>>({})
    const [masterNotes, setMasterNotes] = useState<Record<string, string>>({})
    
    // Стейты UI
    const [returnMethodModal, setReturnMethodModal] = useState<{ isOpen: boolean; requestId: string | null }>({ isOpen: false, requestId: null })
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)

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
                
                // Если мы обновили статус для открытой карточки, то обновим и локально чтобы UI не моргал
                if (selectedRequest && selectedRequest.id === id) {
                    setSelectedRequest({ ...selectedRequest, status: newStatus, ...additionalData })
                }
                
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
        } catch (e) {
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

        const valOrig = rawOrig ? Number(rawOrig) : null
        const valNonOrig = rawNonOrig ? Number(rawNonOrig) : null

        if (valOrig === null && valNonOrig === null) {
            toast.error('Укажите хотя бы одну цену')
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
                    status: 'price_approval' 
                }),
            })

            if (res.ok) {
                toast.success('Отправлено клиенту на согласование')
                setPriceNotified(prev => ({ ...prev, [id]: true }))
                
                // локально обновляем UI
                if (selectedRequest && selectedRequest.id === id) {
                    setSelectedRequest((prev: any) => ({
                        ...prev,
                        priceOriginal: valOrig,
                        priceNonOriginal: valNonOrig,
                        masterNotes: masterNotes[id] || req.masterNotes || '',
                        status: 'price_approval'
                    }))
                }

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
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-5 pb-5 overflow-x-hidden">
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

                {/* Индикатор начальной загрузки */}
                {loading && requests.length === 0 ? (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                        {requests.map(req => (
                            <motion.div key={req.id} layout>
                                <Card 
                                    className="overflow-hidden border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all active:scale-[0.98]"
                                    onClick={() => setSelectedRequest(req)}
                                >
                                    <CardContent className="p-3">
                                        {/* Строка 1: Модель и номер */}
                                        <div className="flex items-center justify-between mb-2 mt-1">
                                            <h3 className="font-bold text-gray-900 text-sm truncate leading-tight pr-2">{req.deviceModel}</h3>
                                            <span className="text-[10px] text-gray-400 font-mono shrink-0">#{req.id.slice(-8)}</span>
                                        </div>
                                        
                                        {/* Строка 2: Статус и Кнопка */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {getStatusBadge(req.status)}
                                            {req.assignedMasterId ? (
                                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                    Взят в работу
                                                </span>
                                            ) : (
                                                <Button 
                                                    size="sm"
                                                    className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-700 font-semibold px-2 py-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        takeJob(req.id);
                                                    }}
                                                >
                                                    Взять в работу
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {/* Строка 3: Поломка и дата */}
                                        <div className="text-[11px] text-gray-600 truncate flex items-center justify-between mt-1">
                                            <span className="truncate pr-2">{req.issueDescription || req.category}</span>
                                            <span className="text-[10px] text-gray-400 shrink-0">
                                                {new Date(req.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Мобильная подробная карточка заявки (BottomSheet) */}
            <AnimatePresence>
                {selectedRequest && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRequest(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        
                        {/* Sheet */}
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] max-w-[800px] mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div>
                                    <div className="text-xs text-gray-400 font-mono mb-0.5">#{selectedRequest.id}</div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedRequest.deviceModel}</h2>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full bg-gray-50 shrink-0" onClick={() => setSelectedRequest(null)}>
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>
                            
                            {/* Контент модалки с прокруткой */}
                            <div className="p-5 overflow-y-auto space-y-6 pb-24">
                                {/* Статус и Категория */}
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Категория</span>
                                        <span className="text-sm font-semibold text-gray-800">{selectedRequest.category}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Текущий status</span>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                </div>

                                {/* Действия / Статусы */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Управление статусом</h3>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            className={cn("justify-start h-11", statusButtonClass(selectedRequest.status, 'received'))}
                                            disabled={!canSetStatus(selectedRequest.status, 'received')}
                                            onClick={() => updateStatus(selectedRequest.id, 'received')}
                                        >
                                            1. Принято в СЦ
                                        </Button>
                                        <Button
                                            className={cn("justify-start h-11", statusButtonClass(selectedRequest.status, 'diagnosing'))}
                                            disabled={!canSetStatus(selectedRequest.status, 'diagnosing')}
                                            onClick={() => updateStatus(selectedRequest.id, 'diagnosing')}
                                        >
                                            2. Начать диагностику
                                        </Button>
                                        <Button
                                            className={cn("justify-start h-11", statusButtonClass(selectedRequest.status, 'repairing'))}
                                            disabled={!canSetStatus(selectedRequest.status, 'repairing')}
                                            onClick={() => updateStatus(selectedRequest.id, 'repairing')}
                                        >
                                            3. Начать ремонт (после согласия)
                                        </Button>
                                        <Button
                                            className={cn("justify-start h-11", statusButtonClass(selectedRequest.status, 'ready_for_pickup', 'green'))}
                                            disabled={!canSetStatus(selectedRequest.status, 'ready_for_pickup')}
                                            onClick={() => {
                                                setReturnMethodModal({ isOpen: true, requestId: selectedRequest.id });
                                                setSelectedRequest(null); 
                                            }}
                                        >
                                            4. Готово к выдаче
                                        </Button>
                                        <Button
                                            className={cn("justify-start h-11", statusButtonClass(selectedRequest.status, 'delivered', 'final'))}
                                            disabled={!canSetStatus(selectedRequest.status, 'delivered')}
                                            onClick={() => updateStatus(selectedRequest.id, 'delivered')}
                                        >
                                            5. Завершить (Выдано)
                                        </Button>
                                    </div>
                                </div>

                                {/* Клиент и логистика */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Клиент и Логистика</h3>
                                    
                                    {(selectedRequest.clientContact || selectedRequest.clientAddress) && (
                                        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                                            {selectedRequest.clientContact && (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase">Связь</span>
                                                    <span className="text-sm font-semibold text-blue-900">{selectedRequest.clientContact}</span>
                                                </div>
                                            )}
                                            {selectedRequest.clientAddress && (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase">Адрес клиента</span>
                                                    <span className="text-sm font-medium text-blue-800 leading-tight">{selectedRequest.clientAddress}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                            {selectedRequest.deliveryMethod === 'courier' ? <Truck className="w-5 h-5 text-orange-500" /> : <MapPin className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div className="text-sm text-gray-700 leading-tight">
                                            {selectedRequest.deliveryMethod === 'courier' ? (
                                                <>Забор курьером: <span className="font-semibold">{selectedRequest.appointmentDate && new Date(selectedRequest.appointmentDate).toLocaleDateString('ru')} в {selectedRequest.appointmentTime}</span></>
                                            ) : (
                                                <span className="font-medium">Самовывоз клиентом</span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedRequest.courierNotes && (
                                        <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm italic text-yellow-800">
                                            {selectedRequest.courierNotes}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Описание поломки */}
                                {selectedRequest.issueDescription && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Жалоба клиента</h3>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
                                            {selectedRequest.issueDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Цены и запчасти */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Финансовый блок</h3>
                                    
                                    {selectedRequest.clientPriceChoice && (
                                        <div className="mb-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col gap-1 shadow-sm">
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                Клиент подтвердил цену
                                            </div>
                                            <div className="text-sm text-emerald-900">Запчасти: <b>{selectedRequest.clientPriceChoice === 'original' ? 'Оригинал' : 'Аналог'}</b></div>
                                            <div className="text-lg font-black text-emerald-700">{selectedRequest.finalPrice?.toLocaleString('ru-RU')} ₽</div>
                                        </div>
                                    )}

                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Цена (Оригинал)</label>
                                                <input
                                                    type="number"
                                                    value={priceDraftOriginal[selectedRequest.id] ?? (selectedRequest.priceOriginal != null ? selectedRequest.priceOriginal.toString() : '')}
                                                    onChange={(e) => setPriceDraftOriginal(prev => ({ ...prev, [selectedRequest.id]: e.target.value }))}
                                                    disabled={selectedRequest.status === 'price_approval' || selectedRequest.clientPriceChoice}
                                                    className="w-full h-11 px-3 text-sm font-semibold rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                                    placeholder="₽"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Цена (Аналог)</label>
                                                <input
                                                    type="number"
                                                    value={priceDraftNonOriginal[selectedRequest.id] ?? (selectedRequest.priceNonOriginal != null ? selectedRequest.priceNonOriginal.toString() : '')}
                                                    onChange={(e) => setPriceDraftNonOriginal(prev => ({ ...prev, [selectedRequest.id]: e.target.value }))}
                                                    disabled={selectedRequest.status === 'price_approval' || selectedRequest.clientPriceChoice}
                                                    className="w-full h-11 px-3 text-sm font-semibold rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                                    placeholder="₽"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Комментарий мастера</label>
                                            <textarea 
                                                value={masterNotes[selectedRequest.id] ?? (selectedRequest.masterNotes || '')}
                                                onChange={(e) => setMasterNotes(prev => ({...prev, [selectedRequest.id]: e.target.value}))}
                                                disabled={selectedRequest.status === 'price_approval' || selectedRequest.clientPriceChoice}
                                                className="w-full h-20 px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none leading-relaxed"
                                                placeholder="Детали поломки..."
                                            />
                                        </div>

                                        {!selectedRequest.clientPriceChoice && selectedRequest.status !== 'price_approval' && (
                                            <Button
                                                size="lg"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20"
                                                onClick={() => handleSavePriceAndNotify(selectedRequest.id, selectedRequest)}
                                            >
                                                Отправить цены клиенту
                                            </Button>
                                        )}
                                        {selectedRequest.status === 'price_approval' && !selectedRequest.clientPriceChoice && (
                                            <div className="w-full py-3 bg-orange-50 border border-orange-100 rounded-xl text-center">
                                                <span className="text-sm font-bold text-orange-600 animate-pulse">Ожидание ответа клиента</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
