import { init, miniApp } from '@telegram-apps/sdk'

let isInitialized = false

// Альтернативная проверка через window.Telegram
export function isTelegramWebAppAvailable(): boolean {
  if (typeof window === 'undefined') return false

  const hasTelegram = !!window.Telegram
  const hasWebApp = !!window.Telegram?.WebApp

  console.log('Window Telegram check:', {
    hasTelegram,
    hasWebApp,
    telegramObject: window.Telegram,
    webAppObject: window.Telegram?.WebApp,
  })

  return hasTelegram && hasWebApp
}

export function initializeTelegramSDK(): boolean {
  if (isInitialized) {
    console.log(
      'SDK already initialized, miniApp exists:',
      !!miniApp
    )
    return !!miniApp
  }

  try {
    console.log('Starting Telegram SDK initialization...')
    console.log(
      'window.Telegram exists:',
      !!window.Telegram
    )
    console.log(
      'window.Telegram.WebApp exists:',
      !!window.Telegram?.WebApp
    )

    // Инициализируем SDK
    init()

    console.log('SDK init() called successfully')
    console.log('miniApp after init:', miniApp)
    console.log('miniApp.ready:', miniApp?.ready)

    isInitialized = true

    console.log('Telegram SDK initialized successfully:', {
      isReady: miniApp?.ready,
      miniAppExists: !!miniApp,
      isInitialized: true,
    })

    return true
  } catch (error) {
    console.warn(
      'Telegram SDK initialization failed (expected in dev mode):',
      error
    )

    // В dev-режиме это нормально - приложение не запущено в Telegram
    if (
      error instanceof Error &&
      error.message.includes('LaunchParamsRetrieveError')
    ) {
      console.log(
        'This is expected when running outside Telegram. Will work in production.'
      )
      isInitialized = true // Помечаем как инициализированный для dev-режима
      return false // Но возвращаем false, так как SDK не работает
    }

    console.error('Unexpected error:', error)
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
  console.log('Checking Telegram availability...')

  // Проверяем через window.Telegram (основной метод)
  const webAppAvailable = isTelegramWebAppAvailable()

  // Проверяем через SDK (дополнительный метод)
  const app = getTelegramMiniApp()
  const sdkAvailable = !!app && !!app.ready

  // Используем любой доступный метод
  const isAvailable = webAppAvailable || sdkAvailable

  console.log('Telegram availability check:', {
    webAppAvailable,
    sdkAvailable,
    appExists: !!app,
    appReady: !!app?.ready,
    isAvailable,
    miniApp: app,
  })

  return isAvailable
}
