'use client'

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

      // Инициализация и расширение
      const setup = () => {
        webApp.ready()
        webApp.expand()
        updateSafeArea()
        setIsReady(true)
      }

      // Обновление safe area
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

        setSafeAreaInsets(newInsets)
        console.log('Final safe area insets:', newInsets)
      }

      // Настройка при загрузке
      setup()

      // Обработчики изменений
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged(updateSafeArea)
      }
      if (webApp.onEvent) {
        webApp.onEvent('viewport_changed', updateSafeArea)
      }

      // Очистка при размонтировании
      return () => {
        if (webApp.offViewportChanged)
          webApp.offViewportChanged(updateSafeArea)
        if (webApp.offEvent)
          webApp.offEvent(
            'viewport_changed',
            updateSafeArea
          )
      }
    }
  }, [])

  return {
    safeAreaInsets,
    isReady,
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
