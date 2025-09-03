// This file is normally used for setting up analytics and other
// services that require one-time initialization on the client.

import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import { init } from './core/init'
import { mockEnv } from './mockEnv'

mockEnv().then(() => {
  try {
    // Проверяем, находимся ли мы в Telegram WebApp
    const isInTelegram =
      typeof window !== 'undefined' &&
      !!(
        window.Telegram?.WebApp ||
        (window as any).TelegramWebviewProxy
      )

    if (!isInTelegram) {
      console.log(
        '🌐 Not in Telegram WebApp, skipping SDK initialization'
      )
      return
    }

    console.log(
      '🚀 In Telegram WebApp, initializing SDK...'
    )

    const launchParams = retrieveLaunchParams()
    const { tgWebAppPlatform: platform } = launchParams
    const debug =
      (launchParams.tgWebAppStartParam || '').includes(
        'debug'
      ) || process.env.NODE_ENV === 'development'

    // Configure all application dependencies.
    init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    })
  } catch (e) {
    console.log('Telegram SDK initialization failed:', e)
  }
})
