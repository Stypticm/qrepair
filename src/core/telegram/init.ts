import { init, miniApp } from '@telegram-apps/sdk'

let isInitialized = false

export function initializeTelegramSDK(): boolean {
  if (isInitialized) {
    return !!miniApp
  }

  try {
    // Инициализируем SDK
    init()

    isInitialized = true

    console.log('Telegram SDK initialized successfully:', {
      isReady: miniApp.ready,
    })

    return true
  } catch (error) {
    console.error(
      'Failed to initialize Telegram SDK:',
      error
    )
    return false
  }
}

export function getTelegramMiniApp():
  | typeof miniApp
  | null {
  if (!isInitialized) {
    initializeTelegramSDK()
  }
  return miniApp
}

export function isTelegramAvailable(): boolean {
  const app = getTelegramMiniApp()
  return !!app && !!app.ready
}
