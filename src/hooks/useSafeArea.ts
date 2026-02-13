'use client'

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react'

interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

interface SafeAreaState {
  safeAreaInsets: SafeAreaInsets
  isReady: boolean
  isTelegram: boolean
  isNativeTelegram: boolean
  theme: 'light' | 'dark'
  isFullscreen: boolean
  isMobile: boolean
  isDesktop: boolean
  isStandalone: boolean
  cssVars: {
    '--safe-area-top': string
    '--safe-area-right': string
    '--safe-area-bottom': string
    '--safe-area-left': string
  }
  setIsMobile: Dispatch<SetStateAction<boolean>>
  setIsDesktop: Dispatch<SetStateAction<boolean>>
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
  const [isNativeTelegram, setIsNativeTelegram] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    'light'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const forceFullscreen = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      !window.Telegram?.WebApp
    ) {
      return
    }

    const webApp = window.Telegram.WebApp
    // Проверяем платформу - только для мобильных вызываем expand/requestFullscreen
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

    // Только для мобильных - разворачиваем на fullscreen
    if (isMobilePlatform) {
      const supportsFullscreen =
        webApp.isVersionAtLeast?.('8.0') || false
      if (
        supportsFullscreen &&
        'requestFullscreen' in webApp &&
        typeof webApp.requestFullscreen === 'function'
      ) {
        webApp.requestFullscreen()
        webApp.expand()
      } else {
        webApp.expand()
      }

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
        }, attempt * 100)
      }
      retryFullscreen()
    } else if (isDesktopPlatform) {
      // На десктопе - НЕ разворачиваем, оставляем компактный режим
      console.log('useSafeArea: Desktop platform detected, keeping compact mode')
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (typeof window === 'undefined') return

    // Device detection
    const userAgent = navigator.userAgent
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    const desktop =
      !mobile &&
      (userAgent.includes('Windows') ||
        userAgent.includes('Mac') ||
        userAgent.includes('Linux'))
    setIsMobile(mobile)
    setIsDesktop(desktop)
    
    // Силовое логирование для дебага
    console.log('useSafeArea debug:', { mobile, desktop, userAgent })


    const checkIsNativeTelegram = () => {
      if (typeof window === 'undefined') return false
      
      const ua = window.navigator.userAgent.toLowerCase()
      const isTgInside = ua.includes('telegram') || !!(window as any).TelegramWebviewProxy
      const isStandalone = (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)
      
      // If it's a PWA, it's NOT a native TG app view
      if (isStandalone) return false
      
      return isTgInside && !!window.Telegram?.WebApp?.platform && window.Telegram.WebApp.platform !== 'unknown'
    }

    const isInTelegram = !!(
      window.Telegram?.WebApp ||
      window.location.href.includes('tgWebAppPlatform') ||
      window.location.href.includes('tgWebAppData') ||
      window.location.href.includes('tgWebAppVersion')
    )

    if (isInTelegram && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      setIsTelegram(true)
      setIsNativeTelegram(checkIsNativeTelegram())

      const setup = async () => {
        try {
          webApp.ready()
          const platform = webApp.platform
          const isMobilePlatform =
            platform === 'android' || platform === 'ios'
          if (isMobilePlatform) {
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
          }

          if (webApp.isVersionAtLeast?.('6.1')) {
            webApp.headerColor = '#2dc2c6'
            webApp.backgroundColor = '#ffffff'
          }

          if (webApp.MainButton) {
            webApp.MainButton.color = '#2dc2c6'
            webApp.MainButton.textColor = '#ffffff'
          }

          if (webApp.themeParams) {
            webApp.themeParams.button_color = '#2dc2c6'
            webApp.themeParams.button_text_color = '#ffffff'
            webApp.themeParams.bg_color = '#ffffff'
            webApp.themeParams.text_color = '#000000'
          }

          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }

          if (
            'isFullscreen' in webApp &&
            webApp.isFullscreen !== undefined
          ) {
            setIsFullscreen(webApp.isFullscreen)
          } else {
            setIsFullscreen(webApp.isExpanded)
          }

          const updateSafeArea = () => {
            let newInsets = {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }
            if (webApp.safeAreaInsets) {
              newInsets = {
                top: Math.min(
                  webApp.safeAreaInsets.top,
                  44
                ),
                right: webApp.safeAreaInsets.right,
                bottom: webApp.safeAreaInsets.bottom,
                left: webApp.safeAreaInsets.left,
              }
            } else if (webApp.safeArea) {
              newInsets = {
                top: Math.min(webApp.safeArea.top, 44),
                right: webApp.safeArea.right,
                bottom: webApp.safeArea.bottom,
                left: webApp.safeArea.left,
              }
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
          setIsReady(true)
        }
      }

      setup()

      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          setIsFullscreen(event.is_expanded || false)
          if (!event.is_expanded) {
            forceFullscreen()
          }
        })
      }

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
          // Только для мобильных - пробуем expand при ошибке
          const platform = webApp.platform
          const isMobilePlatform =
            platform === 'android' || platform === 'ios'
          if (isMobilePlatform) {
            webApp.expand()
          }
        }

        const themeChangedHandler = () => {
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
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
        webApp.onEvent('theme_changed', themeChangedHandler)

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
      setIsTelegram(false)
      setIsReady(true)
    }
  }, [isMounted, forceFullscreen])

  const getState = () => ({
    safeAreaInsets,
    isReady,
    isTelegram,
    isNativeTelegram,
    theme,
    isFullscreen,
    isMobile,
    isDesktop,
    isStandalone: typeof window !== 'undefined' && ((window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)),
    forceFullscreen,
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
    setIsMobile,
    setIsDesktop,
  })

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
      isNativeTelegram: false,
      theme: 'light' as const,
      isFullscreen: false,
      isMobile: false,
      isDesktop: false,
      isStandalone: false,
      forceFullscreen,
      cssVars: {
        '--safe-area-top': '0px',
        '--safe-area-right': '0px',
        '--safe-area-bottom': '0px',
        '--safe-area-left': '0px',
      },
      getState,
      setIsMobile,
      setIsDesktop,
    }
  }

  return {
    safeAreaInsets,
    isReady,
    isTelegram,
    isNativeTelegram,
    theme,
    isFullscreen,
    isMobile,
    isDesktop,
    isStandalone: typeof window !== 'undefined' && ((window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)),
    forceFullscreen,
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
    getState,
    setIsMobile,
    setIsDesktop,
  }
}
