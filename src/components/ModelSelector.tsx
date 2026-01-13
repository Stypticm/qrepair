'use client'

import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useFormData } from '@/hooks/usePersistentState'
import { useDevices } from '@/hooks/useDevices'

// iPhone-специфичные размеры
const IPHONE_BREAKPOINTS = {
  SE: 375,
  MINI: 375,
  STANDARD: 390,
  PLUS: 428,
  PRO_MAX: 430
} as const

const getMaxHeight = (screenWidth: number): string => {
  if (screenWidth <= IPHONE_BREAKPOINTS.SE) return 'max-h-24'
  if (screenWidth <= IPHONE_BREAKPOINTS.STANDARD) return 'max-h-28'
  if (screenWidth <= IPHONE_BREAKPOINTS.PLUS) return 'max-h-32'
  return 'max-h-36'
}

interface ModelSelectorProps {
  onModelChange?: (model: string) => void
  compact?: boolean
}

export const ModelSelector = memo(function ModelSelector({ 
  onModelChange, 
  compact = false 
}: ModelSelectorProps) {
  const { phoneSelection } = useFormData()
  const { models, isLoading } = useDevices()
  const [isExpanded, setIsExpanded] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : IPHONE_BREAKPOINTS.STANDARD
  const maxHeight = getMaxHeight(screenWidth)

  // Автоматическая прокрутка к выбранной модели
  useEffect(() => {
    if (isExpanded && listRef.current && phoneSelection.state.model) {
      const selectedIndex = models.findIndex(model => model === phoneSelection.state.model)
      if (selectedIndex !== -1) {
        const itemHeight = 48 // Примерная высота элемента
        const scrollTop = selectedIndex * itemHeight - itemHeight / 2
        listRef.current.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        })
      }
    }
  }, [isExpanded, phoneSelection.state.model, models])

  const handleModelSelect = useCallback((model: string) => {
    phoneSelection.setState({ model, brand: 'Apple' })
    onModelChange?.(model)
    setIsExpanded(false)
  }, [phoneSelection, onModelChange])

  const selectedModelDisplay = useMemo(() => {
    const model = phoneSelection.state.model
    if (!model) return 'Выберите модель'
    
    // Извлекаем номер модели из строки "Apple iPhone 15 Pro Max"
    const match = model.match(/iPhone (\d+(?:\s+\w+)*)/)
    return match ? `iPhone ${match[1]}` : model
  }, [phoneSelection.state.model])

  if (compact) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm hover:border-gray-300 transition-all duration-200"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {selectedModelDisplay}
              </div>
              <div className="text-xs text-gray-500">
                Модель устройства
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2"
            >
              <div 
                ref={listRef}
                className={`${maxHeight} overflow-y-auto scrollbar-hide border border-gray-200 rounded-xl bg-white shadow-lg backdrop-blur-sm`}
              >
                <div className="p-2 space-y-1">
                  {models.map((model) => (
                    <motion.button
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                        phoneSelection.state.model === model
                          ? 'bg-[#2dc2c6]/10 border border-[#2dc2c6]'
                          : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-md flex items-center justify-center">
                          <Smartphone className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {model.replace('Apple ', '')}
                        </span>
                      </div>
                      {phoneSelection.state.model === model && (
                        <Check className="w-4 h-4 text-[#2dc2c6]" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Выбранная модель
        </h3>
        <p className="text-sm text-gray-600">
          Нажмите для изменения
        </p>
      </div>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm hover:border-gray-300 transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold text-gray-900">
              {selectedModelDisplay}
            </div>
            <div className="text-sm text-gray-500">
              Модель устройства
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`${maxHeight} overflow-y-auto scrollbar-hide border border-gray-200 rounded-xl bg-white shadow-lg backdrop-blur-sm`}>
              <div className="p-3 space-y-2">
                {models.map((model) => (
                  <motion.button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      phoneSelection.state.model === model
                        ? 'bg-[#2dc2c6]/10 border border-[#2dc2c6]'
                        : 'hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {model.replace('Apple ', '')}
                      </span>
                    </div>
                    {phoneSelection.state.model === model && (
                      <Check className="w-4 h-4 text-[#2dc2c6]" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-[#2dc2c6] border-t-transparent rounded-full animate-spin" />
          <span>Загружаем модели...</span>
        </div>
      )}
    </div>
  )
})
