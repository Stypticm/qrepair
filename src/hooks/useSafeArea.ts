'use client'

import { useState, useEffect, useCallback } from 'react'

interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export function useSafeArea() {
  const [safeAreaInsets, setSafeAreaInsets] =
    useState<SafeAreaInsets>({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  const [isReady, setIsReady] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    'light'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Функция для принудительного полноэкранного режима
  const forceFullscreen = useCallback(() => {
    // Проверяем, что мы в Telegram WebApp
    if (
      typeof window === 'undefined' ||
      !window.Telegram?.WebApp
    ) {
      return
    }

    const webApp = window.Telegram.WebApp

    // Проверяем версию Telegram и контекст
    const supportsFullscreen =
      webApp.isVersionAtLeast?.('8.0') || false
    const startParam = webApp.initDataUnsafe?.start_param
    const urlParams = new URLSearchParams(
      window.location.search
    )
    const isFullscreenMode =
      urlParams.get('mode') === 'fullscreen'

    // Вызываем requestFullscreen и expand
    if (
      supportsFullscreen &&
      'requestFullscreen' in webApp &&
      typeof webApp.requestFullscreen === 'function'
    ) {
      webApp.requestFullscreen()
      webApp.expand() // Резервный вызов
    } else {
      webApp.expand()
    }

    // Многократные повторные попытки
    const retryFullscreen = (
      attempt = 1,
      maxAttempts = 3
    ) => {
      setTimeout(() => {
        const isCurrentlyFullscreen =
          'isFullscreen' in webApp
            ? webApp.isFullscreen
            : webApp.isExpanded
        if (
          !isCurrentlyFullscreen &&
          attempt <= maxAttempts
        ) {
          if (
            supportsFullscreen &&
            'requestFullscreen' in webApp
          ) {
            webApp?.requestFullscreen?.()
          } else {
            webApp.expand()
          }
          retryFullscreen(attempt + 1, maxAttempts)
        }
      }, attempt * 100) // Увеличиваем задержку для каждой попытки
    }

    retryFullscreen()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') return

    // Проверяем, действительно ли мы в Telegram WebApp
    const isInTelegram = !!(
      window.Telegram?.WebApp ||
      window.location.href.includes('tgWebAppPlatform') ||
      window.location.href.includes('tgWebAppData') ||
      window.location.href.includes('tgWebAppVersion')
    )

    if (isInTelegram && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      setIsTelegram(true)

      // Добавляем CSS-класс немедленно
      document.documentElement.classList.add(
        'telegram-fullscreen'
      )

      const setup = async () => {
        try {
          // Уведомляем Telegram о готовности
          webApp.ready()

          // Проверяем контекст
          const startParam =
            webApp.initDataUnsafe?.start_param

          // Немедленно запрашиваем fullscreen
          if (
            'requestFullscreen' in webApp &&
            typeof webApp.requestFullscreen ===
              'function' &&
            webApp.isVersionAtLeast?.('8.0')
          ) {
            webApp.requestFullscreen()
            webApp.expand()
          } else {
            webApp.expand()
          }

          // Устанавливаем цвета
          webApp.headerColor = '#2dc2c6'
          webApp.backgroundColor = '#ffffff'

          // Настраиваем цвета кнопок для лучшей видимости
          if (webApp.MainButton) {
            webApp.MainButton.color = '#2dc2c6'
            webApp.MainButton.textColor = '#ffffff'
          }

          // Настраиваем цвета BackButton через themeParams
          if (webApp.themeParams) {
            webApp.themeParams.button_color = '#2dc2c6'
            webApp.themeParams.button_text_color = '#ffffff'
            webApp.themeParams.bg_color = '#ffffff'
            webApp.themeParams.text_color = '#000000'
          }

          // Получаем тему
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }

          // Проверяем статус fullscreen
          if (
            'isFullscreen' in webApp &&
            webApp.isFullscreen !== undefined
          ) {
            setIsFullscreen(webApp.isFullscreen)
          } else {
            setIsFullscreen(webApp.isExpanded)
          }

          // Обновление safe area
          const updateSafeArea = () => {
            let newInsets = {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }
            if (webApp.safeAreaInsets) {
              newInsets = webApp.safeAreaInsets
            } else if (webApp.safeArea) {
              newInsets = webApp.safeArea
            }
            setSafeAreaInsets(newInsets)
          }

          updateSafeArea()
          setIsReady(true)
        } catch (error) {
          console.error(
            'Error initializing Telegram WebApp:',
            error
          )
          setIsReady(true) // Fallback
        }
      }

      setup()

      // Обработчик изменений viewport
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          setIsFullscreen(event.is_expanded || false)

          if (!event.is_expanded) {
            forceFullscreen()
          }
        })
      }

      // Обработчик событий fullscreen
      if (webApp.onEvent) {
        const fullscreenChangedHandler = (event: {
          isFullscreen: boolean
        }) => {
          setIsFullscreen(event.isFullscreen)
          if (!event.isFullscreen) {
            forceFullscreen()
          }
        }

        const fullscreenFailedHandler = (error: any) => {
          console.error('Fullscreen request failed:', error)
          webApp.expand() // Fallback
        }

        webApp.onEvent(
          'fullscreenChanged',
          fullscreenChangedHandler
        )
        webApp.onEvent(
          'fullscreenFailed',
          fullscreenFailedHandler
        )

        // Обработчик темы
        const themeChangedHandler = () => {
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }
        }

        webApp.onEvent('theme_changed', themeChangedHandler)

        // Очистка
        return () => {
          if (webApp.offViewportChanged) {
            webApp.offViewportChanged(() => {})
          }
          if (webApp.offEvent) {
            webApp.offEvent(
              'fullscreenChanged',
              fullscreenChangedHandler
            )
            webApp.offEvent(
              'fullscreenFailed',
              fullscreenFailedHandler
            )
            webApp.offEvent(
              'theme_changed',
              themeChangedHandler
            )
          }
          document.documentElement.classList.remove(
            'telegram-fullscreen'
          )
        }
      }
    } else {
      setIsTelegram(false)
      setIsReady(true)
    }
  }, [isMounted, forceFullscreen])

  if (!isMounted) {
    return {
      safeAreaInsets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      isReady: false,
      isTelegram: false,
      theme: 'light',
      isFullscreen: false,
      forceFullscreen,
      cssVars: {
        '--safe-area-top': '0px',
        '--safe-area-right': '0px',
        '--safe-area-bottom': '0px',
        '--safe-area-left': '0px',
      },
    }
  }

  return {
    safeAreaInsets,
    isReady,
    isTelegram,
    theme,
    isFullscreen,
    forceFullscreen,
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
