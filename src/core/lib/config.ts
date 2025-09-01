'use client'

import { useState, useEffect, useCallback } from 'react'

// Версия приложения - автоматически обновляется скриптом update-version.js
export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || '1.0.3'

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

      // Проверяем версию Telegram согласно документации (Bot API 8.0+)
      const supportsFullscreen =
        webApp.isVersionAtLeast('8.0')
      console.log(
        'Telegram version supports fullscreen:',
        supportsFullscreen
      )

      if (
        supportsFullscreen &&
        'requestFullscreen' in webApp
      ) {
        console.log('Using requestFullscreen...')
        try {
          webApp.requestFullscreen?.()
        } catch (error) {
          console.error('requestFullscreen failed:', error)
          webApp.expand() // Fallback
        }
      } else {
        console.log(
          'requestFullscreen not available, falling back to expand...'
        )
        webApp.expand()
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

          // Пробуем несколько способов для fullscreen
          const supportsFullscreen =
            webApp.isVersionAtLeast('8.0')
          console.log(
            'Fullscreen support:',
            supportsFullscreen
          )
          console.log(
            'Available methods:',
            Object.keys(webApp)
          )

          // Способ 1: Сначала expand, потом fullscreen
          webApp.expand()

          // Способ 2: Пробуем fullscreen с задержкой
          if (
            supportsFullscreen &&
            'requestFullscreen' in webApp
          ) {
            setTimeout(() => {
              console.log(
                'Trying requestFullscreen with delay...'
              )
              try {
                webApp.requestFullscreen?.()
              } catch (error) {
                console.error(
                  'requestFullscreen failed:',
                  error
                )
              }
            }, 500) // Задержка 500ms
          }

          // Способ 3: Принудительно expand несколько раз
          setTimeout(() => {
            console.log('Forcing expand again...')
            webApp.expand()
          }, 1000)

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

          // Принудительно expand после инициализации
          setTimeout(() => {
            console.log(
              'Final expand after initialization...'
            )
            webApp.expand()
          }, 2000)
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

          // Принудительно expand при каждом изменении viewport
          if (!event.is_expanded) {
            console.log(
              'Viewport not expanded, forcing expand...'
            )
            webApp.expand()
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
