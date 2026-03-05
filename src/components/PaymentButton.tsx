'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentRequest } from '@/core/payments/types'
import { paymentGateway } from '@/core/payments/PaymentGateway'
import { CreditCard, Loader2 } from 'lucide-react'
import { initializeTelegramSDK, isTelegramAvailable as checkTelegramAvailable } from '@/core/telegram/init'
import { PaymentSuccessDialog } from './PaymentSuccessDialog'
import { useAppStore } from '@/stores/authStore'

interface PaymentButtonProps {
  amount: number
  description: string
  productId: string
  productDetails?: {
    id: string;
    title: string;
    price: number;
    cover: string | null;
    photos: string[];
    model?: string;
    storage?: string;
    color?: string;
    condition?: string;
    description?: string;
  }
  onSuccess?: (result: any) => void
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({
  amount,
  description,
  productId,
  productDetails,
  onSuccess,
  className = '',
  children
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const telegramId = useAppStore(state => state.telegramId);
  const isGuest = !telegramId || telegramId === 'browser_test_user' || telegramId.startsWith('guest_');

  // Need useRouter to redirect to checkout
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
  // Use cart to temporarily store item if we are doing a direct buy
  const { addToCart, cartItems, isInCart } = require('@/hooks/useCart').useCart();

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
      console.log('=== PaymentButton: Starting Telegram check ===')

      const initialized = initializeTelegramSDK()
      const available = checkTelegramAvailable()
      setIsTelegramAvailable(available)

      console.log('PaymentButton Telegram check result:', {
        initialized,
        available,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
        windowTelegram: !!window.Telegram,
        windowTelegramWebApp: !!window.Telegram?.WebApp
      })

      console.log('=== PaymentButton: Telegram check complete ===')
    }

    // Проверяем сразу
    checkTelegram()

    // Проверяем еще раз через небольшую задержку
    const timeout = setTimeout(checkTelegram, 500)

    return () => clearTimeout(timeout)
  }, [])

  const handlePayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // 1. Add item to cart if it's not already there and productDetails is provided
      if (productId && productDetails && !isInCart(productId)) {
        await addToCart({
          id: productDetails.id,
          title: productDetails.title,
          price: productDetails.price,
          cover: productDetails.cover,
          photos: productDetails.photos,
          model: productDetails.model,
          storage: productDetails.storage,
          color: productDetails.color,
          condition: productDetails.condition,
          description: productDetails.description,
          date: new Date().toISOString(),
        });
      }

      // 2. Redirect to the pickup checkout page (acting as a "checkout" button)
      if (router) {
        // Close modal first
        const closeEvent = new CustomEvent('closeDeviceCard');
        window.dispatchEvent(closeEvent);

        // Wait a slight moment for cart state to serialize if needed
        setTimeout(() => {
          router.push('/cart/checkout');
        }, 100);
      } else {
        setError('Не удалось перейти к оформлению');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Произошла ошибка при подготовке заказа');
      setIsProcessing(false);
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    // Вызываем onSuccess после закрытия диалога
    onSuccess?.({ success: true, transactionId: `order_${Date.now()}` })

    // Закрываем карточку товара через событие (правильный способ)
    const closeEvent = new CustomEvent('closeDeviceCard')
    window.dispatchEvent(closeEvent)
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
              Оформить заказ
            </>
          )
        )}
      </Button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Диалог успешной оплаты */}
      <PaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        amount={amount}
        description={description}
        autoCloseDuration={8000}
        isGuest={isGuest}
      />
    </div>
  )
}
