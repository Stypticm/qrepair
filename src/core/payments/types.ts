export interface PaymentMethod {
  id: string
  name: string
  type: 'telegram' | 'ton' | 'card' | 'crypto'
  icon: string
  isAvailable: boolean
  description?: string
}

export interface PaymentRequest {
  amount: number
  currency: string
  description: string
  productId?: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  method: string
}

export interface PaymentProvider {
  id: string
  name: string
  isAvailable(): boolean
  processPayment(
    request: PaymentRequest
  ): Promise<PaymentResult>
}

export interface ScreenSize {
  width: number
  height: number
  deviceType:
    | 'iphone-se'
    | 'iphone-standard'
    | 'iphone-plus'
    | 'iphone-pro-max'
}
