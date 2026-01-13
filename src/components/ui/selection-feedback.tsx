'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SelectionFeedbackProps {
  isVisible: boolean
  message: string
  type?: 'success' | 'info' | 'warning'
  onClose?: () => void
}

export function SelectionFeedback({ 
  isVisible, 
  message, 
  type = 'success', 
  onClose 
}: SelectionFeedbackProps) {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      // Автоматически скрываем через 3 секунды
      const timer = setTimeout(() => {
        setIsShowing(false)
        onClose?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      case 'info':
        return 'bg-[#2dc2c6] text-white'
      default:
        return 'bg-green-500 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '✅'
    }
  }

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${getTypeStyles()} rounded-full px-6 py-3 shadow-lg flex items-center space-x-3 max-w-sm`}>
            <span className="text-lg">{getIcon()}</span>
            <span className="text-sm font-medium">{message}</span>
            <button
              onClick={() => {
                setIsShowing(false)
                onClose?.()
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Хук для использования обратной связи
export function useSelectionFeedback() {
  const [feedback, setFeedback] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'info' | 'warning'
  })

  const showFeedback = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedback({ isVisible: true, message, type })
  }

  const hideFeedback = () => {
    setFeedback(prev => ({ ...prev, isVisible: false }))
  }

  return {
    feedback,
    showFeedback,
    hideFeedback
  }
}
