'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { paymentGateway } from '@/core/payments/PaymentGateway'

interface PaymentSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  autoCloseDuration?: number
  isGuest?: boolean
}

export function PaymentSuccessDialog({
  isOpen,
  onClose,
  amount,
  description,
  autoCloseDuration = 8000, // Увеличим время, чтобы успели прочитать
  isGuest = true
}: PaymentSuccessDialogProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDuration / 1000)

  // Форматирование цены в Apple стиле
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  // Автозакрытие с таймером
  useEffect(() => {
    if (!isOpen) return

    setTimeLeft(autoCloseDuration / 1000)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, autoCloseDuration, onClose])

  // iPhone-адаптивные стили
  const getDialogStyles = () => {
    const baseStyles = 'bg-white rounded-3xl shadow-2xl border border-gray-100'
    return `${baseStyles} ${paymentGateway.getDialogStyles()}`
  }

  const getIconSize = () => {
    // iPhone-адаптивные размеры иконки
    if (typeof window === 'undefined') return 'w-16 h-16'

    const { innerHeight } = window
    if (innerHeight <= 667) return 'w-12 h-12' // iPhone SE
    if (innerHeight <= 812) return 'w-14 h-14' // iPhone Standard
    if (innerHeight <= 896) return 'w-16 h-16' // iPhone Plus
    return 'w-18 h-18' // iPhone Pro Max
  }

  const getTextStyles = () => {
    if (typeof window === 'undefined') return 'text-2xl'

    const { innerHeight } = window
    if (innerHeight <= 667) return 'text-xl' // iPhone SE
    if (innerHeight <= 812) return 'text-2xl' // iPhone Standard
    if (innerHeight <= 896) return 'text-2xl' // iPhone Plus
    return 'text-3xl' // iPhone Pro Max
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop с blur эффектом */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] pointer-events-auto"
            onClick={(e) => {
              // Предотвращаем случайное закрытие по клику на фон в этом важном окне
              e.stopPropagation()
            }}
          />

          {/* Диалог */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            transition={{
              duration: 0.2,
              ease: 'easeOut'
            }}
            className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none`}
          >
            <div className={`${getDialogStyles()} pointer-events-auto relative`} onClick={(e) => e.stopPropagation()}>
              {/* Крестик закрытия */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="p-6 pt-8 text-center">
                {/* Apple-style иконка успеха */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className={`${getIconSize()} rounded-full bg-[#34C759] flex items-center justify-center`}>
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Заголовок */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className={`${getTextStyles()} font-semibold text-[#1D1D1F] mb-3`}
                >
                  Заказ принят
                </motion.h2>

                {/* Информационное сообщение */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="mb-4 px-4 py-3 bg-blue-50 rounded-2xl border border-blue-100"
                >
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {isGuest
                      ? "Оператор скоро свяжется с вами для подтверждения доставки."
                      : "Вы можете отслеживать статус заказа в разделе 'Мои устройства'."
                    }
                  </p>
                </motion.div>

                {/* Предложение регистрации для гостей */}
                {isGuest && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left"
                  >
                    <p className="text-xs text-gray-500 mb-2">💡 Совет:</p>
                    <p className="text-sm text-gray-700">
                      Зарегистрируйтесь, чтобы отслеживать статус этого и будущих заказов в реальном времени.
                    </p>
                  </motion.div>
                )}

                {/* Описание товара */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="text-base text-gray-600 mb-2"
                >
                  {description}
                </motion.p>

                {/* Сумма */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="text-lg font-medium text-[#1D1D1F] mb-6"
                >
                  {formatPrice(amount)}
                </motion.p>

                {/* Таймер автозакрытия */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.5,
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="text-sm text-gray-500"
                >
                  Автозакрытие через {timeLeft}с или кликните вне окна
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
