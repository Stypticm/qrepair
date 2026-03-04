'use client'

import { useState, useEffect } from 'react'
import { Page } from '@/components/Page'
import { useAppStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Loader2, RotateCcw, Trash2, Plus, X, Phone, User, Calendar, Clock, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'
import { OrderStatusTracker } from '@/components/OrderStatusTracker'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled'

interface Order {
    id: string
    telegramId: string
    deliveryMethod: string
    deliveryAddress?: string
    deliveryDate?: string
    deliveryTime?: string
    pickupPointId?: number
    pickupPoint?: {
        id: number
        address: string
        name: string
        workingHours: string
    }
    status: OrderStatus
    totalPrice: number
    createdAt: string
    updatedAt: string
    confirmedAt?: string
    inDeliveryAt?: string
    completedAt?: string
    courierName?: string
    courierPhone?: string
    trackingNotes?: string
    items: Array<{
        id: string
        title: string
        price: number
        lot: {
            id: string
            title: string
            model?: string
            storage?: string
            color?: string
        }
    }>
}

function AdminOrdersContent() {
    const telegramId = useAppStore(state => state.telegramId)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
    const [couriers, setCouriers] = useState<Array<{ id: string, telegramId: string }>>([])
    const [selectedCourier, setSelectedCourier] = useState<{ [key: string]: string }>({})

    const searchParams = useSearchParams()

    // Editing states for existing orders
    const [editingAddress, setEditingAddress] = useState<{ [key: string]: string }>({})
    const [editingDate, setEditingDate] = useState<{ [key: string]: string }>({})
    const [editingTime, setEditingTime] = useState<{ [key: string]: string }>({})

    // Creation states for manual leads
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newLead, setNewLead] = useState({ name: '', phone: '', address: '', date: '', time: '' })
    const [isCreating, setIsCreating] = useState(false)

    const toggleCard = (orderId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev)
            if (newSet.has(orderId)) {
                newSet.delete(orderId)
            } else {
                newSet.add(orderId)
            }
            return newSet
        })
    }

    useEffect(() => {
        loadOrders()
        loadStaff()

        // Handle URL parameters for pre-filling manual lead
        const shouldCreate = searchParams.get('create') === 'true'
        if (shouldCreate) {
            const name = searchParams.get('name') || ''
            const phone = searchParams.get('phone') || ''
            const telegramIdParam = searchParams.get('telegramId') || ''

            setNewLead({
                name,
                phone,
                address: '',
                date: '',
                time: ''
            })
            setIsCreateModalOpen(true)
        }
    }, [telegramId, searchParams])

    const loadStaff = async () => {
        if (!telegramId) return
        try {
            const res = await fetch('/api/admin/staff', {
                headers: { 'x-admin-id': telegramId }
            })
            if (res.ok) {
                const data = await res.json()
                setCouriers(data.users.filter((u: any) => u.role === 'COURIER'))
            }
        } catch (e) {
            console.error('Error loading staff:', e)
        }
    }

    const loadOrders = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            const res = await fetch('/api/admin/orders')
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (e) {
            console.error('Ошибка при загрузке заказов:', e)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
        try {
            setUpdatingOrderId(orderId)
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, notes })
            })

            if (res.ok) {
                await loadOrders(true)
                toast.success('Статус обновлен')
            } else {
                toast.error('Ошибка при обновлении статуса')
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса:', e)
            toast.error('Ошибка при обновлении статуса')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const handleAssignCourier = async (orderId: string) => {
        const courierId = selectedCourier[orderId]
        if (!courierId) return toast.error('Выберите курьера')

        try {
            setUpdatingOrderId(orderId)
            const res = await fetch('/api/admin/assign-courier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: orderId,
                    type: 'ORDER',
                    courierId,
                    adminTelegramId: telegramId
                })
            })
            if (res.ok) {
                await loadOrders(true)
                toast.success('Курьер назначен')
            } else {
                toast.error('Ошибка при назначении курьера')
            }
        } catch (e) {
            toast.error('Ошибка при назначении курьера')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const handleUpdateOrderDetails = async (orderId: string) => {
        try {
            setUpdatingOrderId(orderId)
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: editingAddress[orderId],
                    deliveryDate: editingDate[orderId],
                    deliveryTime: editingTime[orderId],
                    adminTelegramId: telegramId
                })
            })
            if (res.ok) {
                await loadOrders(true)
                setEditingAddress(prev => { const n = { ...prev }; delete n[orderId]; return n; })
                setEditingDate(prev => { const n = { ...prev }; delete n[orderId]; return n; })
                setEditingTime(prev => { const n = { ...prev }; delete n[orderId]; return n; })
                toast.success('Детали заказа сохранены')
            } else {
                toast.error('Ошибка при сохранении')
            }
        } catch (e) {
            toast.error('Ошибка при сохранении')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Вы уверены, что хотите безвозвратно удалить этот заказ?')) return

        try {
            setUpdatingOrderId(orderId)
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'DELETE',
                headers: { 'x-telegram-id': telegramId || '' }
            })

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId))
                toast.success('Заказ удален')
            } else {
                toast.error('Ошибка при удалении')
            }
        } catch (e) {
            toast.error('Ошибка при удалении')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const handleCreateManualLead = async () => {
        if (!newLead.name || !newLead.phone) return toast.error('Имя и телефон обязательны')

        try {
            setIsCreating(true)
            const res = await fetch('/api/admin/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newLead,
                    adminTelegramId: telegramId
                })
            })
            if (res.ok) {
                toast.success('Заявка создана')
                setIsCreateModalOpen(false)
                setNewLead({ name: '', phone: '', address: '', date: '', time: '' })
                // If we created a lead, it might not show up here if this page only shows Orders.
                // But typically managers would check "Requests" section for leads.
                // We'll reload orders just in case.
                loadOrders(true)
            } else {
                toast.error('Ошибка при создании')
            }
        } catch (e) {
            toast.error('Ошибка при создании')
        } finally {
            setIsCreating(false)
        }
    }

    const getStatusBadgeColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500'
            case 'confirmed': return 'bg-blue-500'
            case 'in_delivery': return 'bg-purple-500'
            case 'completed': return 'bg-green-500'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusText = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'Новый'
            case 'confirmed': return 'Подтвержден'
            case 'in_delivery': return 'В доставке'
            case 'completed': return 'Завершен'
            case 'cancelled': return 'Отменен'
            default: return status
        }
    }

    const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`
    const formatDate = (date: string) => new Date(date).toLocaleString('ru-RU')

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus)

    return (
        <Page back={true}>
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Заказы</h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Управление клиентскими заказами и доставкой</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-lg shadow-blue-500/20 font-bold transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Создать заявку
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => loadOrders()}
                                disabled={loading}
                                className="rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11 w-11 p-0 shadow-sm transition-all active:rotate-180"
                            >
                                <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Фильтры */}
                    <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 rounded-[2rem] p-2 border border-gray-100">
                        {['all', 'pending', 'confirmed', 'in_delivery', 'completed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`px-5 py-2.5 rounded-[1.5rem] font-bold text-xs uppercase tracking-wider transition-all duration-300 ${filterStatus === status
                                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200/50'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {status === 'all' ? `Все (${orders.length})` : getStatusText(status as any)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-64 opacity-50">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-400 font-bold animate-pulse">Загрузка данных...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                                <RotateCcw className="w-8 h-8 text-gray-200" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Заказов пока нет</h2>
                            <p className="text-gray-400 max-w-xs mx-auto">Здесь будут отображаться новые заказы ваших клиентов</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map((order) => {
                                const isExpanded = expandedCards.has(order.id)
                                const isUpdating = updatingOrderId === order.id

                                return (
                                    <Card key={order.id} className="bg-white border-0 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden ring-1 ring-gray-100">
                                        <CardHeader
                                            className="p-6 md:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors duration-300"
                                            onClick={() => toggleCard(order.id)}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                                        <Badge className={`${getStatusBadgeColor(order.status)} text-white hover:opacity-90 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-0`}>
                                                            {getStatusText(order.status)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                                                        <span className="text-blue-600 font-bold">{formatPrice(order.totalPrice)}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-400">{order.items.length} товар(а)</span>
                                                        <span className="text-gray-300 hidden sm:inline">•</span>
                                                        <span className="text-gray-400 text-xs">{formatDate(order.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-90">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 rotate-180" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                    className="overflow-hidden"
                                                >
                                                    <CardContent className="px-6 md:px-8 pb-8 pt-0 space-y-8">
                                                        {/* Status Tracker */}
                                                        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                                                            <OrderStatusTracker
                                                                status={order.status}
                                                                createdAt={new Date(order.createdAt)}
                                                                confirmedAt={order.confirmedAt ? new Date(order.confirmedAt) : null}
                                                                inDeliveryAt={order.inDeliveryAt ? new Date(order.inDeliveryAt) : null}
                                                                completedAt={order.completedAt ? new Date(order.completedAt) : null}
                                                                hideDescription={true}
                                                            />
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            {/* Client info */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-1">Клиент</h4>
                                                                <div className="bg-white border border-gray-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                                        {order.telegramId.slice(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{order.telegramId}</p>
                                                                        <p className="text-xs text-gray-400">Telegram Client</p>
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-1 mt-6">Товары</h4>
                                                                <div className="space-y-3">
                                                                    {order.items.map((item) => (
                                                                        <div key={item.id} className="bg-gray-50/80 p-4 rounded-2xl flex justify-between items-center group hover:bg-blue-50/50 transition-colors">
                                                                            <div>
                                                                                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{item.title}</p>
                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.lot.model || 'Device'}</p>
                                                                            </div>
                                                                            <span className="font-bold text-gray-900 text-sm">{formatPrice(item.price)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Delivery & Controls */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-1">Доставка</h4>
                                                                <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50 space-y-5">
                                                                    {order.deliveryMethod === 'pickup' && order.pickupPoint ? (
                                                                        <div className="flex gap-4">
                                                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-blue-900 text-sm">{order.pickupPoint.name}</p>
                                                                                <p className="text-xs text-blue-600/70 mt-1 leading-relaxed">{order.pickupPoint.address}</p>
                                                                                <p className="text-[10px] font-black text-blue-400 uppercase mt-2">{order.pickupPoint.workingHours}</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-5">
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                                                    <span className="text-xl">🚚</span>
                                                                                </div>
                                                                                <h5 className="font-bold text-blue-900">Курьерская доставка</h5>
                                                                            </div>

                                                                            <div className="grid gap-4">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Адрес назначения</label>
                                                                                    <input
                                                                                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                                                                        value={editingAddress[order.id] !== undefined ? editingAddress[order.id] : (order.deliveryAddress || '')}
                                                                                        onChange={(e) => setEditingAddress(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                                                        placeholder="Укажите адрес..."
                                                                                    />
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    <div className="space-y-1.5">
                                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Дата</label>
                                                                                        <input
                                                                                            type="date"
                                                                                            className="w-full h-11 bg-white border border-gray-200 rounded-2xl px-4 text-sm outline-none shadow-sm"
                                                                                            value={editingDate[order.id] !== undefined ? editingDate[order.id] : (order.deliveryDate || '')}
                                                                                            onChange={(e) => setEditingDate(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1.5">
                                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Время</label>
                                                                                        <input
                                                                                            type="time"
                                                                                            className="w-full h-11 bg-white border border-gray-200 rounded-2xl px-4 text-sm outline-none shadow-sm"
                                                                                            value={editingTime[order.id] !== undefined ? editingTime[order.id] : (order.deliveryTime || '')}
                                                                                            onChange={(e) => setEditingTime(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                {(editingAddress[order.id] !== undefined || editingDate[order.id] !== undefined || editingTime[order.id] !== undefined) && (
                                                                                    <Button
                                                                                        onClick={() => handleUpdateOrderDetails(order.id)}
                                                                                        disabled={isUpdating}
                                                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-2"
                                                                                    >
                                                                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                                        Сохранить детали
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Status Management */}
                                                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                                    <div className="flex flex-wrap gap-2 pt-4">
                                                                        {order.status === 'pending' && (
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                                                disabled={isUpdating}
                                                                                className="flex-1 bg-gray-900 text-white hover:bg-black rounded-2xl h-12 font-bold active:scale-95"
                                                                            >Подтвердить</Button>
                                                                        )}
                                                                        {order.status === 'confirmed' && (
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(order.id, 'in_delivery')}
                                                                                disabled={isUpdating}
                                                                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl h-12 font-bold active:scale-95"
                                                                            >Отправить курьером</Button>
                                                                        )}
                                                                        {order.status === 'in_delivery' && (
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                                                disabled={isUpdating}
                                                                                className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-2xl h-12 font-bold active:scale-95"
                                                                            >Завершить</Button>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            onClick={() => updateOrderStatus(order.id, 'cancelled', 'Админ')}
                                                                            disabled={isUpdating}
                                                                            className="px-6 h-12 rounded-2xl text-red-500 hover:bg-red-50 font-bold"
                                                                        >Отмена</Button>
                                                                    </div>
                                                                )}

                                                                {order.status === 'cancelled' && (
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => deleteOrder(order.id)}
                                                                        disabled={isUpdating}
                                                                        className="w-full h-12 rounded-2xl font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all border-0 shadow-none"
                                                                    ><Trash2 className="w-4 h-4 mr-2" /> Удалить навсегда</Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Lead Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-white/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col"
                        >
                            <div className="p-8 pb-0 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Новая заявка</h2>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Ручное добавление для менеджера</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all active:scale-95">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Имя клиента</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                                value={newLead.name}
                                                onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Имя или никнейм..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Телефон / Telegram ID</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                                value={newLead.phone}
                                                onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+79..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Адрес доставки</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <input
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                                value={newLead.address}
                                                onChange={(e) => setNewLead(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="Улица, дом, кв..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Дата</label>
                                            <input
                                                type="date"
                                                className="w-full h-14 bg-gray-50/50 border border-gray-100 rounded-2xl px-4 text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                                value={newLead.date}
                                                onChange={(e) => setNewLead(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Время</label>
                                            <input
                                                type="time"
                                                className="w-full h-14 bg-gray-50/50 border border-gray-100 rounded-2xl px-4 text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                                value={newLead.time}
                                                onChange={(e) => setNewLead(prev => ({ ...prev, time: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCreateManualLead}
                                    disabled={isCreating}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] h-14 font-black text-base shadow-xl shadow-blue-500/30 transition-all active:scale-95"
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    Создать заявку
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Page>
    );
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <AdminOrdersContent />
        </Suspense>
    )
}
