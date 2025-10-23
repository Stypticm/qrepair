import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentMethod,
  ScreenSize,
} from './types'
import { TonPaymentProvider } from './providers/TonPaymentProvider'
import { TelegramPaymentProvider } from './providers/TelegramPaymentProvider'

export class PaymentGateway {
  private providers: PaymentProvider[] = []
  private screenSize: ScreenSize | null = null

  constructor() {
    this.providers = [new TelegramPaymentProvider()]
    this.detectScreenSize()
  }

  private detectScreenSize(): void {
    if (typeof window === 'undefined') return

    const { innerWidth, innerHeight } = window
    const height = innerHeight

    if (height <= 667) {
      this.screenSize = {
        width: innerWidth,
        height,
        deviceType: 'iphone-se',
      }
    } else if (height <= 812) {
      this.screenSize = {
        width: innerWidth,
        height,
        deviceType: 'iphone-standard',
      }
    } else if (height <= 896) {
      this.screenSize = {
        width: innerWidth,
        height,
        deviceType: 'iphone-plus',
      }
    } else {
      this.screenSize = {
        width: innerWidth,
        height,
        deviceType: 'iphone-pro-max',
      }
    }
  }

  getAvailableMethods(): PaymentMethod[] {
    return this.providers
      .filter((provider) => provider.isAvailable())
      .map((provider) => ({
        id: provider.id,
        name: provider.name,
        type: 'telegram' as const,
        icon: this.getMethodIcon(provider.id),
        isAvailable: true,
        description: this.getMethodDescription(provider.id),
      }))
  }

  private getMethodIcon(methodId: string): string {
    return '💳' // Только карты для Telegram Payments
  }

  private getMethodDescription(methodId: string): string {
    return 'Карты, Apple Pay, Google Pay'
  }

  async processPayment(
    methodId: string,
    request: PaymentRequest
  ): Promise<PaymentResult> {
    const provider = this.providers.find(
      (p) => p.id === methodId
    )
    if (!provider) {
      return {
        success: false,
        error: 'Payment method not found',
        method: methodId,
      }
    }

    if (!provider.isAvailable()) {
      return {
        success: false,
        error: 'Payment method not available',
        method: methodId,
      }
    }

    return provider.processPayment(request)
  }

  // iPhone-адаптивные стили для кнопок
  getPaymentButtonStyles(): string {
    if (!this.screenSize) return 'h-12 px-6 py-3'

    switch (this.screenSize.deviceType) {
      case 'iphone-se':
        return 'h-12 px-4 py-3 text-sm'
      case 'iphone-standard':
        return 'h-14 px-6 py-4 text-base'
      case 'iphone-plus':
        return 'h-14 px-6 py-4 text-base'
      case 'iphone-pro-max':
        return 'h-16 px-8 py-5 text-lg'
      default:
        return 'h-12 px-6 py-3'
    }
  }

  getDialogStyles(): string {
    if (!this.screenSize) return 'max-w-xs mx-2'

    switch (this.screenSize.deviceType) {
      case 'iphone-se':
        return 'max-w-xs mx-1 max-h-[80vh]'
      case 'iphone-standard':
        return 'max-w-sm mx-2 max-h-[85vh]'
      case 'iphone-plus':
        return 'max-w-sm mx-3 max-h-[85vh]'
      case 'iphone-pro-max':
        return 'max-w-md mx-4 max-h-[85vh]'
      default:
        return 'max-w-xs mx-2 max-h-[80vh]'
    }
  }
}

// Singleton instance
export const paymentGateway = new PaymentGateway()
