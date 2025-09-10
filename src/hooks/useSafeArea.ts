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
        'No Telegram WebApp context available at',
        new Date().toISOString()
      )
      return
    }

    const webApp = window.Telegram.WebApp
      'Attempting to request fullscreen at',
      new Date().toISOString(),
      'URL:',
      window.location.href
    )

    // Проверяем версию Telegram и контекст
    const supportsFullscreen =
      webApp.isVersionAtLeast?.('8.0') || false
    const startParam = webApp.initDataUnsafe?.start_param
    const urlParams = new URLSearchParams(
      window.location.search
    )
    const isFullscreenMode =
      urlParams.get('mode') === 'fullscreen'
      'Supports fullscreen:',
      supportsFullscreen,
      'Start param:',
      startParam,
      'Is Fullscreen Mode:',
      isFullscreenMode
    )

    // Вызываем requestFullscreen и expand
    if (
      supportsFullscreen &&
      'requestFullscreen' in webApp &&
      typeof webApp.requestFullscreen === 'function'
    ) {
      webApp.requestFullscreen()
      webApp.expand() // Резервный вызов
    } else {
        'requestFullscreen not available, using expand...'
      )
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
            `Fullscreen not achieved, retrying (attempt ${attempt}/${maxAttempts}) at`,
            new Date().toISOString()
          )
          if (
            supportsFullscreen &&
            'requestFullscreen' in webApp
          ) {
            webApp?.requestFullscreen?.()
            webApp.expand()
          } else {
            webApp.expand()
          }
          retryFullscreen(attempt + 1, maxAttempts)
        } else if (isCurrentlyFullscreen) {
            'Fullscreen achieved:',
            isCurrentlyFullscreen,
            'at',
            new Date().toISOString()
          )
        } else {
            'Fullscreen not achieved after',
            maxAttempts,
            'attempts at',
            new Date().toISOString()
          )
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
            'Calling webApp.ready at',
            new Date().toISOString()
          )
          webApp.ready()

          // Проверяем контекст
          const startParam =
            webApp.initDataUnsafe?.start_param
            'Start param:',
            startParam,
            'URL:',
            window.location.href
          )

          // Немедленно запрашиваем fullscreen
          if (
            'requestFullscreen' in webApp &&
            typeof webApp.requestFullscreen ===
              'function' &&
            webApp.isVersionAtLeast?.('8.0')
          ) {
              'Calling requestFullscreen immediately after ready at',
              new Date().toISOString()
            )
            webApp.requestFullscreen()
            webApp.expand()
          } else {
              'requestFullscreen not available, calling expand immediately at',
              new Date().toISOString()
            )
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
              'Initial fullscreen status:',
              webApp.isFullscreen
            )
          } else {
            setIsFullscreen(webApp.isExpanded)
              'Initial expanded status:',
              webApp.isExpanded
            )
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
                'Using safeAreaInsets:',
                newInsets
              )
            } else if (webApp.safeArea) {
              newInsets = webApp.safeArea
            }
            setSafeAreaInsets(newInsets)
          }

          updateSafeArea()
          setIsReady(true)
            'Telegram WebApp initialized successfully at',
            new Date().toISOString()
          )
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
            'Viewport changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.is_expanded || false)

          if (!event.is_expanded) {
              'Viewport not in fullscreen, retrying at',
              new Date().toISOString()
            )
            forceFullscreen()
          }
        })
      }

      // Обработчик событий fullscreen
      if (webApp.onEvent) {
        const fullscreenChangedHandler = (event: {
          isFullscreen: boolean
        }) => {
            'Fullscreen changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.isFullscreen)
          if (!event.isFullscreen) {
              'Not in fullscreen, retrying at',
              new Date().toISOString()
            )
            forceFullscreen()
          }
        }

        const fullscreenFailedHandler = (error: any) => {
          console.error(
            'Fullscreen request failed:',
            error,
            'at',
            new Date().toISOString()
          )
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
              'Theme changed:',
              webApp.colorScheme,
              'at',
              new Date().toISOString()
            )
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
        'Not in Telegram environment, showing app immediately at',
        new Date().toISOString()
      )
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
