'use client'

import { motion } from 'framer-motion'

interface BatteryIndicatorProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
}

export function BatteryIndicator({ percentage, size = 'md' }: BatteryIndicatorProps) {
  const getBatteryColor = (percent: number) => {
    if (percent >= 90) return 'bg-green-500'
    if (percent >= 75) return 'bg-yellow-500'
    if (percent >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getBatteryLabel = (percent: number) => {
    if (percent >= 90) return 'Отличное состояние'
    if (percent >= 75) return 'Хорошее состояние'
    if (percent >= 60) return 'Среднее состояние'
    return 'Требует замены'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-4 text-xs'
      case 'lg':
        return 'w-16 h-8 text-sm'
      default:
        return 'w-12 h-6 text-xs'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center space-y-1"
    >
      {/* Батарея */}
      <div className={`relative ${getSizeClasses()} bg-gray-200 rounded-sm border border-gray-300 overflow-hidden`}>
        <div
          className={`h-full ${getBatteryColor(percentage)} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold drop-shadow-sm">
            {percentage}%
          </span>
        </div>
      </div>
      
      {/* Подсказка */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <span className={`text-xs font-medium ${getBatteryColor(percentage).replace('bg-', 'text-')}`}>
          {getBatteryLabel(percentage)}
        </span>
      </motion.div>
    </motion.div>
  )
}
