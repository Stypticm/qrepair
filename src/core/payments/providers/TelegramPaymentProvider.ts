import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
} from '../types'
import { getTelegramMiniApp } from '../../telegram/init'

export class TelegramPaymentProvider
  implements PaymentProvider
{
  id = 'telegram'
  name = 'Telegram Payments'

  isAvailable(): boolean {
    const miniApp = getTelegramMiniApp()
    return !!miniApp && !!miniApp.ready
  }

  async processPayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      const miniApp = getTelegramMiniApp()
      if (!miniApp || !miniApp.ready) {
        return {
          success: false,
          error: 'Telegram Mini App недоступен. Откройте приложение через Telegram.',
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

      // Открываем платежную форму Telegram через SDK
      // Пока используем старый метод, так как новый SDK может не поддерживать openInvoice
      const webApp = window.Telegram?.WebApp
      if (webApp) {
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
      } else {
        throw new Error('Telegram WebApp not available')
      }

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
