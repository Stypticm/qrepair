'use client'

import { useState, useEffect, useCallback } from 'react'

// Версия приложения - автоматически обновляется скриптом update-version.js
export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || '1.0.1'

// Функция для получения версии с автоматическим увеличением
export const getAutoVersion = () => {
  return appVersion
}

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
      console.log(
        'Attempting to request fullscreen at',
        new Date().toISOString()
      )

      // Проверяем версию Telegram и контекст
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
              'Fullscreen not achieved, retrying immediately at',
              new Date().toISOString()
            )
            if (
              supportsFullscreen &&
              'requestFullscreen' in webApp
            ) {
              webApp?.requestFullscreen?.()
            } else {
              webApp.expand()
            }
          } else {
            console.log(
              'Fullscreen achieved:',
              isCurrentlyFullscreen
            )
          }
        }, 0) // Немедленный вызов через setTimeout(..., 0)
      }
    } else {
      console.log('No Telegram WebApp context available')
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

      // Добавляем CSS-класс для корневого элемента
      document.documentElement.classList.add(
        'telegram-fullscreen'
      )

      const setup = async () => {
        try {
          // Уведомляем Telegram о готовности
          console.log(
            'Calling webApp.ready at',
            new Date().toISOString()
          )
          webApp.ready()

          // Проверяем, открыто ли через Menu Button
          const isMenuButton =
            !webApp.initDataUnsafe?.start_param
          console.log(
            'Is Menu Button:',
            isMenuButton,
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
            console.log(
              'Calling requestFullscreen immediately after ready at',
              new Date().toISOString()
            )
            webApp?.requestFullscreen?.()
          } else {
            console.log(
              'requestFullscreen not available, calling expand immediately at',
              new Date().toISOString()
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
            console.log(
              'Initial fullscreen status:',
              webApp.isFullscreen
            )
          } else {
            setIsFullscreen(webApp.isExpanded)
            console.log(
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
          console.log(
            'Viewport changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.is_expanded || false)

          if (!event.is_expanded) {
            console.log(
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
          console.log(
            'Fullscreen changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.isFullscreen)
          if (!event.isFullscreen) {
            console.log(
              'Not in fullscreen, retrying immediately at',
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
            console.log(
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
          // Удаляем CSS-класс при размонтировании
          document.documentElement.classList.remove(
            'telegram-fullscreen'
          )
        }
      }
    } else {
      console.log(
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
