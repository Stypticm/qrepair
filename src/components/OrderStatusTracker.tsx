'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled'

interface OrderStatusTrackerProps {
    status: OrderStatus
    createdAt: Date
    confirmedAt?: Date | null
    inDeliveryAt?: Date | null
    completedAt?: Date | null
}

const statusConfig = {
    pending: {
        label: 'Принят',
        icon: '📝',
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
    },
    confirmed: {
        label: 'Подтвержден',
        icon: '✓',
        color: 'bg-green-500',
        textColor: 'text-green-600'
    },
    in_delivery: {
        label: 'В пути',
        icon: '🚚',
        color: 'bg-purple-500',
        textColor: 'text-purple-600'
    },
    completed: {
        label: 'Доставлен',
        icon: '✓',
        color: 'bg-teal-500',
        textColor: 'text-teal-600'
    },
    cancelled: {
        label: 'Отменен',
        icon: '✕',
        color: 'bg-red-500',
        textColor: 'text-red-600'
    }
}

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'in_delivery', 'completed']

export function OrderStatusTracker({
    status,
    createdAt,
    confirmedAt,
    inDeliveryAt,
    completedAt
}: OrderStatusTrackerProps) {
    const formatDate = (date: Date | null | undefined) => {
        if (!date) return '--:--'
        const d = new Date(date)
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
    }

    const getStatusDate = (statusKey: OrderStatus) => {
        switch (statusKey) {
            case 'pending':
                return createdAt
            case 'confirmed':
                return confirmedAt
            case 'in_delivery':
                return inDeliveryAt
            case 'completed':
                return completedAt
            default:
                return null
        }
    }

    const currentIndex = statusOrder.indexOf(status)
    const isCancelled = status === 'cancelled'

    if (isCancelled) {
        return (
            <div className="py-4">
                <div className="flex items-center justify-center gap-2 text-red-600">
                    <span className="text-2xl">✕</span>
                    <span className="font-semibold">Заказ отменен</span>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                    {formatDate(createdAt)}
                </p>
            </div>
        )
    }

    return (
        <div className="py-4">
            {/* Прогресс-бар */}
            <div className="relative">
                {/* Линия фона */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

                {/* Активная линия */}
                <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{
                        width: `${(currentIndex / (statusOrder.length - 1)) * 100}%`
                    }}
                />

                {/* Точки статусов */}
                <div className="relative flex justify-between">
                    {statusOrder.map((statusKey, index) => {
                        const config = statusConfig[statusKey]
                        const isCompleted = index < currentIndex
                        const isCurrent = index === currentIndex
                        const isPending = index > currentIndex
                        const statusDate = getStatusDate(statusKey)

                        return (
                            <div key={statusKey} className="flex flex-col items-center" style={{ flex: 1 }}>
                                {/* Точка */}
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10 ${isCompleted || isCurrent ? config.color : 'bg-gray-300'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 text-white" />
                                    ) : isCurrent ? (
                                        <span className="text-lg">{config.icon}</span>
                                    ) : (
                                        <div className="w-3 h-3 bg-white rounded-full" />
                                    )}
                                </motion.div>

                                {/* Название статуса */}
                                <p
                                    className={`text-xs font-medium mt-2 text-center ${isCompleted || isCurrent ? config.textColor : 'text-gray-400'
                                        }`}
                                >
                                    {config.label}
                                </p>

                                {/* Дата */}
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {formatDate(statusDate)}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Текущий статус (крупно) */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">Текущий статус:</p>
                <p className={`text-lg font-semibold ${statusConfig[status].textColor}`}>
                    {statusConfig[status].label}
                </p>
            </div>
        </div>
    )
}
