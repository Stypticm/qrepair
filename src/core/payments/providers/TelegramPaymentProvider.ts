import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
} from '../types'

export class TelegramPaymentProvider
  implements PaymentProvider
{
  id = 'telegram'
  name = 'Telegram Payments'

  isAvailable(): boolean {
    // Упрощенная проверка для демо - всегда доступен в браузере
    return typeof window !== 'undefined'
  }

  async processPayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      const webApp = window.Telegram?.WebApp
      if (!webApp) {
        return {
          success: false,
          error: 'Telegram WebApp недоступен. Откройте приложение через Telegram.',
          method: 'telegram',
        }
      }

      // Создаем инвойс для Telegram Payments
      const invoice = {
        title: request.description,
        description: `Оплата за ${request.description}`,
        payload: JSON.stringify({
          productId: request.productId,
          amount: request.amount,
          currency: request.currency,
          ...request.metadata,
        }),
        provider_token:
          process.env.NEXT_PUBLIC_TELEGRAM_PAYMENT_TOKEN ||
          '',
        currency: request.currency,
        prices: [
          {
            label: request.description,
            amount: Math.round(request.amount * 100), // Telegram требует копейки
          },
        ],
      }

      // Отправляем инвойс через Telegram Bot API
      const response = await fetch(
        '/api/payments/create-invoice',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoice),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const { invoice_link } = await response.json()

      // Открываем платежную форму Telegram
      webApp.openInvoice(invoice_link, (status: string) => {
        if (status === 'paid') {
          return {
            success: true,
            transactionId: `telegram_${Date.now()}`,
            method: 'telegram',
          }
        } else {
          return {
            success: false,
            error: 'Payment cancelled or failed',
            method: 'telegram',
          }
        }
      })

      return {
        success: true,
        transactionId: `telegram_${Date.now()}`,
        method: 'telegram',
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Telegram payment failed',
        method: 'telegram',
      }
    }
  }
}
