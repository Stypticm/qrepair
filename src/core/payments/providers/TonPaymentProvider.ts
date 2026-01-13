import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
} from '../types'
import { sendTon } from '../../ton/tonconnect'

export class TonPaymentProvider implements PaymentProvider {
  id = 'ton'
  name = 'TON'

  isAvailable(): boolean {
    // Упрощенная проверка для демо - всегда доступен в браузере
    return typeof window !== 'undefined'
  }

  async processPayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      // Конвертируем рубли в TON (примерный курс)
      const tonAmount = request.amount / 100 // 1 TON ≈ 100₽
      const nanoTonAmount = String(tonAmount * 1e9)

      // Демо адрес - в продакшене должен быть ваш кошелек
      const walletAddress =
        'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'

      await sendTon(
        walletAddress,
        nanoTonAmount,
        request.description
      )

      return {
        success: true,
        transactionId: `ton_${Date.now()}`,
        method: 'ton',
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'TON payment failed',
        method: 'ton',
      }
    }
  }
}
