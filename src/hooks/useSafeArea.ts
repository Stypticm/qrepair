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

      const setup = () => {
        webApp.ready()
        webApp.expand()
        updateSafeArea()
        setIsReady(true)
      }

      const updateSafeArea = () => {
        let newInsets = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }
        if (webApp.safeAreaInsets) {
          newInsets = webApp.safeAreaInsets
        } else if (webApp.safeArea) {
          newInsets = webApp.safeArea
        }
        setSafeAreaInsets(newInsets)
        console.log('Updated safeAreaInsets:', newInsets)
      }

      setup()
      if (webApp.onViewportChanged)
        webApp.onViewportChanged(updateSafeArea)
      if (webApp.onEvent)
        webApp.onEvent('viewport_changed', updateSafeArea)

      return () => {
        if (webApp.offViewportChanged)
          webApp.offViewportChanged(updateSafeArea)
        if (webApp.offEvent)
          webApp.offEvent(
            'viewport_changed',
            updateSafeArea
          )
      }
    } else {
      console.warn(
        'Telegram.WebApp not available, using default insets'
      )
      setIsReady(true) // Разрешаем рендер вне Telegram
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
