'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function ProgressBar({ currentStep, totalSteps, steps = [] }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100
  
  // Проверяем, что steps существует и содержит достаточно элементов
  const currentStepName = steps && steps.length > 0 && currentStep > 0 && currentStep <= steps.length 
    ? steps[currentStep - 1] 
    : `Шаг ${currentStep}`

  return (
    <div className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-md mx-auto">
        {/* Прогресс-бар */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Шаг {currentStep} из {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Полоса прогресса */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2dc2c6] to-[#25a8ac] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Текущий шаг */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-2"
        >
          <span className="text-sm font-semibold text-[#2dc2c6]">
            {currentStepName}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
