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
        let newInsets = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }

        // Приоритет safeAreaInsets (новый API)
        if (webApp.safeAreaInsets) {
          newInsets = webApp.safeAreaInsets
          console.log('Using safeAreaInsets:', newInsets)
        }
        // Fallback на safeArea (старый API)
        else if (webApp.safeArea) {
          newInsets = webApp.safeArea
          console.log('Using safeArea:', newInsets)
        }

        // Для iOS добавляем дополнительный отступ сверху если нужно
        if (
          webApp.platform === 'ios' &&
          newInsets.top === 0
        ) {
          // Примерные значения для разных устройств iOS
          const isIPhoneX = window.innerHeight >= 812
          const isIPhone12Plus = window.innerHeight >= 844
          const isIPhone14Plus = window.innerHeight >= 926

          if (isIPhone14Plus) newInsets.top = 59
          else if (isIPhone12Plus) newInsets.top = 47
          else if (isIPhoneX) newInsets.top = 44

          console.log(
            'iOS device detected, added top inset:',
            newInsets.top
          )
        }

        setSafeAreaInsets(newInsets)
        console.log('Final safe area insets:', newInsets)
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
          console.log(
            'Viewport changed, updating safe area'
          )
          updateSafeArea()
        })
      }

      // Слушаем изменения safe area (альтернативный способ)
      if (webApp.onEvent) {
        webApp.onEvent('viewport_changed', () => {
          console.log(
            'Viewport changed event, updating safe area'
          )
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
