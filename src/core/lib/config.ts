'use client'

import { useState, useEffect, useCallback } from 'react'

// Версия приложения - автоматически обновляется скриптом update-version.js
export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || '1.4.26'

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
    if (
      typeof window !== 'undefined' &&
      window.Telegram?.WebApp
    ) {
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

      const platform = webApp.platform
      const isMobilePlatform =
        platform === 'android' || platform === 'ios'
      if (isMobilePlatform) {
        if (
          supportsFullscreen &&
          'requestFullscreen' in webApp
        ) {
          console.log('Using requestFullscreen...')
          try {
            webApp.requestFullscreen?.()
          } catch (error) {
            console.error(
              'requestFullscreen failed:',
              error
            )
          }
        } else {
          console.log(
            'requestFullscreen not available, using expand...'
          )
          webApp.expand()
        }
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

    if (
      typeof window !== 'undefined' &&
      window.Telegram?.WebApp
    ) {
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

          // Платформа и разрешение fullscreen только для мобильных
          const platform = webApp.platform
          const isMobilePlatform =
            platform === 'android' || platform === 'ios'

          // АГРЕССИВНЫЙ ПОДХОД (мобильные только): Принудительно заставляем fullscreen
          console.log(
            'Available methods:',
            Object.keys(webApp)
          )

          // Способ 1: Множественные вызовы expand
          console.log(
            'Calling webApp.expand() multiple times...'
          )
          if (isMobilePlatform) webApp.expand()

          // Способ 2: Проверяем fullscreen поддержку
          const supportsFullscreen =
            webApp.isVersionAtLeast('8.0')
          console.log(
            'Fullscreen support:',
            supportsFullscreen
          )

          // Способ 3: Если поддерживается, пробуем fullscreen
          if (
            supportsFullscreen &&
            'requestFullscreen' in webApp
          ) {
            console.log('Attempting requestFullscreen...')
            try {
              if (isMobilePlatform)
                webApp.requestFullscreen?.()
            } catch (error) {
              console.error(
                'requestFullscreen failed:',
                error
              )
            }
          }

          // Способ 4: Принудительно expand каждые 100ms в течение 2 секунд
          const expandInterval = setInterval(() => {
            console.log('Forcing expand...')
            if (isMobilePlatform) webApp.expand()
          }, 100)

          // Останавливаем интервал через 2 секунды
          setTimeout(() => {
            clearInterval(expandInterval)
            console.log('Stopped forced expand interval')
          }, 2000)

          // Способ 5: Дополнительные попытки с задержками
          const delays = [500, 1000, 1500, 2000, 2500, 3000]
          delays.forEach((delay: number) => {
            setTimeout(() => {
              console.log(`Retry expand at ${delay}ms...`)
              if (isMobilePlatform) webApp.expand()

              // Если поддерживается fullscreen, пробуем снова
              if (
                supportsFullscreen &&
                'requestFullscreen' in webApp
              ) {
                try {
                  if (isMobilePlatform)
                    webApp.requestFullscreen?.()
                } catch (error) {
                  console.error(
                    `requestFullscreen failed at ${delay}ms:`,
                    error
                  )
                }
              }
            }, delay)
          })

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

          // Логируем успешную инициализацию
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
          console.log(
            'Viewport changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.is_expanded || false)

          // ПРИНУДИТЕЛЬНО expand если viewport не развернут (только мобильные)
          if (!event.is_expanded) {
            console.log(
              'Viewport not expanded, FORCING expand...'
            )
            const platform = webApp.platform
            const isMobilePlatform =
              platform === 'android' || platform === 'ios'
            if (isMobilePlatform) webApp.expand()

            // Если поддерживается fullscreen, пробуем снова
            if (
              webApp.isVersionAtLeast('8.0') &&
              'requestFullscreen' in webApp
            ) {
              try {
                const platform2 = webApp.platform
                const isMobilePlatform2 =
                  platform2 === 'android' ||
                  platform2 === 'ios'
                if (isMobilePlatform2)
                  webApp.requestFullscreen?.()
              } catch (error) {
                console.error(
                  'requestFullscreen failed in viewport handler:',
                  error
                )
              }
            }
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

          // ПРИНУДИТЕЛЬНО expand если не в fullscreen
          if (!event.isFullscreen) {
            console.log(
              'Not in fullscreen, FORCING expand...'
            )
            webApp.expand()

            // Если поддерживается fullscreen, пробуем снова
            if (
              webApp.isVersionAtLeast('8.0') &&
              'requestFullscreen' in webApp
            ) {
              try {
                webApp.requestFullscreen?.()
              } catch (error) {
                console.error(
                  'requestFullscreen failed in fullscreen handler:',
                  error
                )
              }
            }
          }
        }

        const fullscreenFailedHandler = (error: any) => {
          console.error(
            'Fullscreen request failed:',
            error,
            'at',
            new Date().toISOString()
          )

          // ПРИНУДИТЕЛЬНО expand если fullscreen не удался
          console.log(
            'Fullscreen failed, FORCING expand...'
          )
          webApp.expand()
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
