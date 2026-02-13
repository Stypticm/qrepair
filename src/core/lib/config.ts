'use client'

import { useState, useEffect, useCallback } from 'react'

// Версия приложения - автоматически обновляется скриптом update-version.js
export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || '1.4.307'

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

      // Проверяем, не выполняется ли уже запрос
      if ((webApp as any)._isRequestingFullscreen) {
        console.log(
          'Fullscreen request already in progress, skipping...'
        )
        return
      }

      ;(webApp as any)._isRequestingFullscreen = true

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
          try {
            webApp.expand()
          } catch (error) {
            console.error('expand failed:', error)
          }
        }
      }

      // Сбрасываем флаг через 1 секунду
      setTimeout(() => {
        ;(webApp as any)._isRequestingFullscreen = false
      }, 1000)
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

      // Добавляем класс для определения платформы Telegram
      const platform = webApp.platform
      const isMobilePlatform =
        platform === 'android' || platform === 'ios'
      const isDesktopPlatform =
        !isMobilePlatform &&
        (platform === 'tdesktop' ||
          platform === 'macos' ||
          platform === 'web' ||
          platform === 'weba' ||
          platform === 'windows' ||
          platform === 'linux')

      // Добавляем CSS-классы в зависимости от платформы
      // На мобильных - fullscreen класс (для fullscreen режима)
      // На десктопе - НЕ добавляем fullscreen класс (компактный режим)
      if (isMobilePlatform) {
        document.documentElement.classList.add(
          'telegram-fullscreen',
          'telegram-mobile'
        )
      } else if (isDesktopPlatform) {
        // На десктопе - НЕ добавляем telegram-fullscreen, только telegram-desktop
        // Это позволит CSS стилям ограничить размер окна
        document.documentElement.classList.add(
          'telegram-desktop'
        )
      }

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

          // Для мобильных - fullscreen (на весь экран телефона)
          // Для десктопа - НЕ вызываем expand/requestFullscreen (компактный режим)
          if (isMobilePlatform) {
            const supportsFullscreen =
              webApp.isVersionAtLeast('8.0') && 'requestFullscreen' in webApp
            
            console.log('Mobile platform detected, expanding to fullscreen...')
            
            // Вызываем expand() и requestFullscreen() сразу (без задержек)
            webApp.expand()
            
            if (supportsFullscreen) {
              try {
                webApp.requestFullscreen?.()
              } catch (error) {
                console.error('requestFullscreen failed:', error)
              }
            }
            
            // Дополнительные ретраи для надежности (как в болванке)
            const retryDelays = [120, 300, 700]
            retryDelays.forEach((delay: number) => {
              setTimeout(() => {
                webApp.expand()
                if (supportsFullscreen) {
                  try {
                    webApp.requestFullscreen?.()
                  } catch (error) {
                    console.error(`requestFullscreen failed at ${delay}ms:`, error)
                  }
                }
              }, delay)
            })
          } else {
            // Для десктопа - компактный режим (не вызываем expand/requestFullscreen)
            console.log('Desktop platform detected, keeping compact mode')
            
            // На десктопе - ВКЛЮЧАЕМ свайпы для работы на тачпаде
            if (typeof (webApp as any).enableVerticalSwipes === 'function') {
              try {
                (webApp as any).enableVerticalSwipes()
                console.log('Desktop: enableVerticalSwipes applied for touchpad support')
              } catch (error) {
                console.error('enableVerticalSwipes failed on desktop:', error)
              }
            }
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
        webApp.onViewportChanged((event: { is_expanded: boolean }) => {
          console.log(
            'Viewport changed:',
            event,
            'at',
            new Date().toISOString()
          )
          setIsFullscreen(event.is_expanded || false)

          // Разворачиваем если viewport не развернут (только мобильные)
          if (!event.is_expanded) {
            const platform = webApp.platform
            const isMobilePlatform =
              platform === 'android' || platform === 'ios'
            
            if (isMobilePlatform) {
              console.log('Viewport not expanded, FORCING expansion...')
              webApp.expand()
              
              if (
                webApp.isVersionAtLeast('8.0') &&
                'requestFullscreen' in webApp
              ) {
                try {
                  webApp.requestFullscreen?.()
                } catch (error) {
                  console.error(
                    'requestFullscreen failed in viewport handler:',
                    error
                  )
                }
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

          // ПРИНУДИТЕЛЬНО expand если не в fullscreen (только для мобильных)
          // На десктопе - НЕ разворачиваем, оставляем компактный режим
          if (!event.isFullscreen) {
            const platform = webApp.platform
            const isMobilePlatform =
              platform === 'android' || platform === 'ios'
            const isDesktopPlatform = !isMobilePlatform && (
              platform === 'tdesktop' ||
              platform === 'macos' ||
              platform === 'web' ||
              platform === 'weba' ||
              platform === 'windows' ||
              platform === 'linux'
            )

            if (isMobilePlatform) {
              console.log('Not in fullscreen, FORCING expansion...')
              webApp.expand()

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
            } else if (isDesktopPlatform) {
              // На десктопе - НЕ разворачиваем, оставляем компактный режим
              console.log('Desktop: keeping compact mode, not expanding')
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

          // ПРИНУДИТЕЛЬНО expand если fullscreen не удался (только для мобильных)
          // На десктопе - НЕ разворачиваем, оставляем компактный режим
          const platform = webApp.platform
          const isMobilePlatform =
            platform === 'android' || platform === 'ios'
          const isDesktopPlatform = !isMobilePlatform && (
            platform === 'tdesktop' ||
            platform === 'macos' ||
            platform === 'web' ||
            platform === 'weba' ||
            platform === 'windows' ||
            platform === 'linux'
          )

          if (isMobilePlatform) {
            console.log(
              'Fullscreen failed, FORCING expand...'
            )
            webApp.expand()
          } else if (isDesktopPlatform) {
            // На десктопе - НЕ разворачиваем, оставляем компактный режим
            console.log('Desktop: fullscreen failed, keeping compact mode')
          }
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
          // Удаляем CSS-классы при размонтировании
          document.documentElement.classList.remove(
            'telegram-fullscreen',
            'telegram-mobile',
            'telegram-desktop'
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
