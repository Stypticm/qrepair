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
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      console.log('Attempting to request fullscreen...')

      // Проверяем версию Telegram
      const supportsFullscreen =
        webApp.isVersionAtLeast?.('8.0') || false
      const isMenuButton =
        !webApp.initDataUnsafe?.start_param
      const urlParams = new URLSearchParams(
        window.location.search
      )
      const isFullscreenMode =
        urlParams.get('mode') === 'fullscreen'

      if (
        supportsFullscreen &&
        'requestFullscreen' in webApp &&
        typeof webApp.requestFullscreen === 'function'
      ) {
        console.log('Using requestFullscreen...')
        webApp.requestFullscreen()
      } else {
        console.log(
          'requestFullscreen not available or older version, falling back to expand...'
        )
        webApp.expand()
      }

      // Немедленная повторная попытка для Menu Button или mode=fullscreen
      if (isMenuButton || isFullscreenMode) {
        console.log(
          'Menu Button or fullscreen mode detected, ensuring fullscreen...'
        )
        setTimeout(() => {
          const isCurrentlyFullscreen =
            'isFullscreen' in webApp
              ? webApp.isFullscreen
              : webApp.isExpanded
          if (!isCurrentlyFullscreen) {
            console.log(
              'Fullscreen not achieved, retrying immediately...'
            )
            if (
              supportsFullscreen &&
              'requestFullscreen' in webApp
            ) {
              webApp?.requestFullscreen?.()
            } else {
              webApp.expand()
            }
          }
        }, 0) // Немедленный вызов через setTimeout(..., 0)
      }
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      setIsTelegram(true)

      const setup = async () => {
        try {
          // Уведомляем Telegram о готовности
          webApp.ready()

          // Проверяем, открыто ли через Menu Button
          const isMenuButton =
            !webApp.initDataUnsafe?.start_param
          console.log('Is Menu Button:', isMenuButton)

          // Немедленно запрашиваем fullscreen
          if (
            'requestFullscreen' in webApp &&
            typeof webApp.requestFullscreen === 'function'
          ) {
            console.log(
              'Calling requestFullscreen immediately after ready...'
            )
            webApp.requestFullscreen()
          } else {
            console.log(
              'requestFullscreen not available, calling expand immediately...'
            )
            webApp.expand()
          }

          // Устанавливаем цвета
          webApp.headerColor = '#2dc2c6'
          webApp.backgroundColor = '#ffffff'

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
              console.log(
                'Using safeAreaInsets:',
                newInsets
              )
            } else if (webApp.safeArea) {
              newInsets = webApp.safeArea
              console.log('Using safeArea:', newInsets)
            }
            setSafeAreaInsets(newInsets)
          }

          updateSafeArea()
          setIsReady(true)
          console.log(
            'Telegram WebApp initialized successfully'
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
          console.log('Viewport changed:', event)
          setIsFullscreen(event.is_expanded || false)

          if (!event.is_expanded) {
            console.log(
              'Viewport not in fullscreen, retrying...'
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
          console.log('Fullscreen changed:', event)
          setIsFullscreen(event.isFullscreen)
          if (!event.isFullscreen) {
            console.log('Not in fullscreen, retrying...')
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
        }
      }
    } else {
      console.log(
        'Not in Telegram environment, showing app immediately'
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
