'use client'

import { useState, useEffect } from 'react'
import { Page } from '@/components/Page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'
import { OrderStatusTracker } from '@/components/OrderStatusTracker'

type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled'

interface Order {
    id: string
    userId: string
    deliveryMethod: string
    deliveryAddress?: string
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

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

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
    }, [filterStatus])

    const loadOrders = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            const url = filterStatus === 'all'
                ? '/api/admin/orders'
                : `/api/admin/orders?status=${filterStatus}`

            const res = await fetch(url)
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
            } else {
                alert('Ошибка при обновлении статуса')
            }
        } catch (e) {
            console.error('Ошибка при обновлении статуса:', e)
            alert('Ошибка при обновлении статуса')
        } finally {
            setUpdatingOrderId(null)
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadOrders()}
                            disabled={loading}
                            className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 gap-2 h-10 px-4"
                        >
                            <span className={loading ? 'animate-spin' : ''}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                    <path d="M21 3v5h-5" />
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                    <path d="M3 21v-5h5" />
                                </svg>
                            </span>
                            Сверка с БД
                        </Button>
                    </div>

                    {/* Фильтры */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Все ({orders.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'pending'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Новые ({orders.filter(o => o.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('confirmed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'confirmed'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Подтверждены ({orders.filter(o => o.status === 'confirmed').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('in_delivery')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'in_delivery'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            В доставке ({orders.filter(o => o.status === 'in_delivery').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'completed'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Завершены ({orders.filter(o => o.status === 'completed').length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Image
                                src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                                alt="Загрузка"
                                width={96}
                                height={96}
                                className="object-contain"
                            />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 text-lg">Заказов нет</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => {
                                const isExpanded = expandedCards.has(order.id)
                                const isUpdating = updatingOrderId === order.id

                                return (
                                    <Card key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        <CardHeader
                                            className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                            onClick={() => toggleCard(order.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-4">
                                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                                        Заказ #{order.id.slice(0, 8)}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {order.items.length} товар{order.items.length === 1 ? '' : order.items.length < 5 ? 'а' : 'ов'} · {formatPrice(order.totalPrice)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className={`${getStatusBadgeColor(order.status)} text-white px-3 py-1 text-sm font-medium`}>
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <CardContent className="pt-0 space-y-4">
                                                        {/* Order Status Tracker */}
                                                        <OrderStatusTracker
                                                            status={order.status}
                                                            createdAt={new Date(order.createdAt)}
                                                            confirmedAt={order.confirmedAt ? new Date(order.confirmedAt) : null}
                                                            inDeliveryAt={order.inDeliveryAt ? new Date(order.inDeliveryAt) : null}
                                                            completedAt={order.completedAt ? new Date(order.completedAt) : null}
                                                            hideDescription={true}
                                                        />

                                                        {/* Клиент */}
                                                        <div className="border-t pt-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Клиент:</p>
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-sm text-gray-800">Telegram ID: {order.userId}</p>
                                                            </div>
                                                        </div>

                                                        {/* Товары */}
                                                        <div className="border-t pt-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Товары:</p>
                                                            <div className="space-y-2">
                                                                {order.items.map((item) => (
                                                                    <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                                                                        <p className="font-semibold text-gray-900">{item.title}</p>
                                                                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Доставка */}
                                                        <div className="border-t pt-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Способ получения:</p>
                                                            {order.deliveryMethod === 'pickup' && order.pickupPoint ? (
                                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="text-xl">🏪</span>
                                                                        <div>
                                                                            <p className="font-semibold text-gray-900">{order.pickupPoint.name}</p>
                                                                            <p className="text-sm text-gray-600">{order.pickupPoint.address}</p>
                                                                            <p className="text-sm text-gray-600">🕒 {order.pickupPoint.workingHours}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                                    <p className="text-gray-900">Курьерская доставка</p>
                                                                    {order.deliveryAddress && (
                                                                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Управление статусом */}
                                                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                            <div className="border-t pt-4">
                                                                <p className="text-sm font-semibold text-gray-700 mb-3">Управление:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {order.status === 'pending' && (
                                                                        <>
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                                                disabled={isUpdating}
                                                                                className="bg-blue-500 hover:bg-blue-600 text-white min-w-[120px]"
                                                                            >
                                                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                                Подтвердить
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => updateOrderStatus(order.id, 'cancelled', 'Отменен администратором')}
                                                                                disabled={isUpdating}
                                                                                variant="outline"
                                                                                className="border-red-500 text-red-500 hover:bg-red-50 min-w-[120px]"
                                                                            >
                                                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                                Отменить
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    {order.status === 'confirmed' && (
                                                                        <Button
                                                                            onClick={() => updateOrderStatus(order.id, 'in_delivery')}
                                                                            disabled={isUpdating}
                                                                            className="bg-purple-500 hover:bg-purple-600 text-white min-w-[150px]"
                                                                        >
                                                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                            Отправить в доставку
                                                                        </Button>
                                                                    )}
                                                                    {order.status === 'in_delivery' && (
                                                                        <Button
                                                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                                                            disabled={isUpdating}
                                                                            className="bg-green-500 hover:bg-green-600 text-white min-w-[120px]"
                                                                        >
                                                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                            Завершить
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Заметки */}
                                                        {order.trackingNotes && (
                                                            <div className="border-t pt-4">
                                                                <p className="text-sm font-semibold text-gray-700 mb-2">Заметки:</p>
                                                                <div className="bg-yellow-50 p-3 rounded-lg">
                                                                    <p className="text-sm text-gray-800">{order.trackingNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
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
        </Page>
    )
}
