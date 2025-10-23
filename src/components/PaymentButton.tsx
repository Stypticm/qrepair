'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentRequest } from '@/core/payments/types'
import { paymentGateway } from '@/core/payments/PaymentGateway'
import { CreditCard, Loader2 } from 'lucide-react'
import { initializeTelegramSDK, isTelegramAvailable as checkTelegramAvailable } from '@/core/telegram/init'

interface PaymentButtonProps {
  amount: number
  description: string
  productId?: string
  onSuccess?: (result: any) => void
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({ 
  amount, 
  description, 
  productId, 
  onSuccess,
  className = '',
  children 
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)

  const paymentRequest: PaymentRequest = {
    amount,
    currency: 'RUB',
    description,
    productId,
    metadata: {
      timestamp: Date.now(),
      source: 'device_card'
    }
  }

  // Проверяем доступность Telegram SDK
  useEffect(() => {
    const checkTelegram = () => {
      const available = checkTelegramAvailable()
      setIsTelegramAvailable(available)
      
      console.log('Telegram SDK check:', {
        initialized: initializeTelegramSDK(),
        available,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
      })
    }

    // Проверяем сразу
    checkTelegram()

    // Проверяем еще раз через небольшую задержку
    const timeout = setTimeout(checkTelegram, 200)
    
    return () => clearTimeout(timeout)
  }, [])

  const handlePayment = async () => {
    if (!isTelegramAvailable) {
      setError('Telegram WebApp недоступен. Откройте приложение через Telegram.')
      return
    }

    const availableMethods = paymentGateway.getAvailableMethods()
    if (availableMethods.length === 0) {
      setError('Способы оплаты недоступны')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const result = await paymentGateway.processPayment(availableMethods[0].id, paymentRequest)
      
      if (result.success) {
        onSuccess?.(result)
        console.log('Payment successful:', result)
      } else {
        setError(result.error || 'Ошибка оплаты')
      }
    } catch (err) {
      setError('Произошла ошибка при обработке платежа')
    } finally {
      setIsProcessing(false)
    }
  }

  // Если Telegram недоступен, показываем ошибку вместо кнопки
  if (!isTelegramAvailable) {
    return (
      <div className="w-full">
        <div className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium">Откройте через Telegram</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 active:scale-[0.98] ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Обработка...
          </>
        ) : (
          children || (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Оплатить заказ
            </>
          )
        )}
      </Button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  )
}
