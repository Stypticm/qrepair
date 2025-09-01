'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface FeatureExplanationProps {
  type: 'faceId' | 'touchId'
  isWorking: boolean
  onSelect: (working: boolean) => void
}

export function FeatureExplanation({ type, isWorking, onSelect }: FeatureExplanationProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getFeatureInfo = () => {
    if (type === 'faceId') {
      return {
        title: 'Face ID',
        workingTitle: 'Работает',
        notWorkingTitle: 'Не работает',
        workingDescription: 'Телефон разблокируется при взгляде на экран',
        notWorkingDescription: 'Необходимо вводить пароль для разблокировки',
        impact: 'Влияет на цену: -5%',
        icon: '👁️'
      }
    } else {
      return {
        title: 'Touch ID',
        workingTitle: 'Работает',
        notWorkingTitle: 'Не работает',
        workingDescription: 'Отпечаток пальца разблокирует телефон',
        notWorkingDescription: 'Необходимо вводить пароль для разблокировки',
        impact: 'Влияет на цену: -3%',
        icon: '👆'
      }
    }
  }

  const info = getFeatureInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Заголовок с иконкой */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-2xl">{info.icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[#2dc2c6] hover:text-[#25a8ac] transition-colors"
        >
          <span className="text-sm">ℹ️</span>
        </button>
      </div>

      {/* Детальное объяснение */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showDetails ? 'auto' : 0, 
          opacity: showDetails ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-[#2dc2c6]/5 rounded-lg p-3 border border-[#2dc2c6]/20">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Как проверить:</strong> Попробуйте разблокировать телефон
          </p>
          <p className="text-xs text-gray-600">
            <strong>Влияние на цену:</strong> {info.impact}
          </p>
        </div>
      </motion.div>

      {/* Кнопки выбора */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(true)}
          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            isWorking === true
              ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="font-medium text-sm">{info.workingTitle}</div>
            <div className="text-xs text-gray-500 mt-1">{info.workingDescription}</div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(false)}
          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            isWorking === false
              ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">❌</div>
            <div className="font-medium text-sm">{info.notWorkingTitle}</div>
            <div className="text-xs text-gray-500 mt-1">{info.notWorkingDescription}</div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}
