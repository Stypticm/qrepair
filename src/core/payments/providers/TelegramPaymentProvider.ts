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
      // Заглушка - имитация успешной оплаты
      console.log('Processing payment (mock):', {
        amount: request.amount,
        description: request.description,
        productId: request.productId,
      })

      // Имитация задержки обработки платежа
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      )

      // Всегда возвращаем успех для демо
      return {
        success: true,
        transactionId: `mock_${Date.now()}`,
        method: 'telegram',
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Payment processing failed',
        method: 'telegram',
      }
    }
  }
}
