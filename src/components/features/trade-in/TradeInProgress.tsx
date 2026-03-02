'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Основные логические шаги (маппинг путей на шаги)
const FLOW_STEPS = [
    { id: 'device', label: 'Устройство', paths: ['/request/device-info', '/request/device-functions', '/request/condition'] },
    { id: 'photos', label: 'Фото', paths: ['/request/photos'] },
    { id: 'evaluation', label: 'Оценка', paths: ['/request/evaluation', '/request/submit'] },
    { id: 'delivery', label: 'Передача', paths: ['/request/delivery-options', '/request/pickup', '/request/pickup-points', '/request/courier', '/request/courier-booking', '/request/form', '/request/agree'] },
]

export function TradeInProgress() {
    const pathname = usePathname()

    // Если мы на финальной странице или не в флоу, не показываем прогресс
    if (!pathname.startsWith('/request') || pathname.includes('/request/final')) {
        return null
    }

    // Находим текущий активный шаг по совпадению с путями
    let currentStepIndex = 0
    for (let i = 0; i < FLOW_STEPS.length; i++) {
        if (FLOW_STEPS[i].paths.some(p => pathname.startsWith(p))) {
            currentStepIndex = i
            break
        }
    }

    return (
        <div className="w-full bg-white/80 backdrop-blur-md pt-safe-top sticky top-0 z-40 border-b border-gray-100/50">
            <div className="max-w-md mx-auto px-6 py-4">
                <div className="relative">
                    {/* Линия прогресса */}
                    <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-gray-100 rounded-full" />
                    <motion.div
                        className="absolute top-[11px] left-0 h-[2px] bg-blue-600 rounded-full"
                        initial={false}
                        animate={{
                            width: `${(currentStepIndex / (FLOW_STEPS.length - 1)) * 100}%`
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    {/* Точки шагов */}
                    <div className="relative flex justify-between">
                        {FLOW_STEPS.map((step, idx) => {
                            const isActive = idx === currentStepIndex
                            const isPast = idx < currentStepIndex

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.2 : 1,
                                            backgroundColor: isPast || isActive ? '#2563eb' : '#f3f4f6',
                                            borderColor: isActive ? '#60a5fa' : 'transparent'
                                        }}
                                        className={`
                      w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors
                      ${isActive ? 'ring-4 ring-blue-100' : ''}
                    `}
                                    >
                                        {isPast ? (
                                            <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                        ) : isActive ? (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        ) : (
                                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                        )}
                                    </motion.div>
                                    <span className={`
                    text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 w-20 text-center
                    ${isActive ? 'text-blue-600' : isPast ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
