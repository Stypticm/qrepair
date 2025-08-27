import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.Telegram?.WebApp
    ) {
      const webApp = window.Telegram.WebApp

      // Функция для обновления safe area
      const updateSafeArea = () => {
        if (webApp.safeAreaInsets) {
          setSafeAreaInsets(webApp.safeAreaInsets)
        } else if (webApp.safeArea) {
          setSafeAreaInsets(webApp.safeArea)
        }
      }

      // Функция для настройки fullscreen режима
      const setupFullscreen = () => {
        // Устанавливаем ready() для уведомления Telegram о готовности приложения
        webApp.ready()

        // Расширяем приложение на весь экран
        webApp.expand()

        // Обновляем safe area
        updateSafeArea()

        setIsReady(true)
      }

      // Настраиваем fullscreen при загрузке
      setupFullscreen()

      // Слушаем изменения safe area
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged(() => {
          updateSafeArea()
        })
      }

      // Слушаем изменения safe area (альтернативный способ)
      if (webApp.onEvent) {
        webApp.onEvent('viewport_changed', () => {
          updateSafeArea()
        })
      }

      // Очистка при размонтировании
      return () => {
        if (webApp.offViewportChanged) {
          webApp.offViewportChanged(() => {})
        }
        if (webApp.offEvent) {
          webApp.offEvent('viewport_changed', () => {})
        }
      }
    }
  }, [])

  return {
    safeAreaInsets,
    isReady,
    // CSS переменные для использования в стилях
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
