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
  const [isTelegram, setIsTelegram] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    'light'
  )
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.Telegram?.WebApp
    ) {
      const webApp = window.Telegram.WebApp
      setIsTelegram(true)

      // Инициализация и расширение как в BotFather
      const setup = () => {
        try {
          // Основные настройки
          webApp.ready()

          // Расширяем на весь экран как в BotFather
          webApp.expand()

          // Включаем подтверждение закрытия
          if (webApp.enableClosingConfirmation) {
            webApp.enableClosingConfirmation()
          }

          // Получаем тему
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }

          // Проверяем статус расширения
          if (webApp.isExpanded !== undefined) {
            setIsExpanded(webApp.isExpanded)
          }

          updateSafeArea()
          setIsReady(true)
          console.log(
            'Telegram WebApp initialized successfully like BotFather'
          )
        } catch (error) {
          console.error(
            'Error initializing Telegram WebApp:',
            error
          )
          // Fallback - показываем приложение даже при ошибке
          setIsReady(true)
        }
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

      // Обработчик изменения темы
      if (webApp.onEvent) {
        webApp.onEvent('theme_changed', () => {
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }
        })
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
        if (webApp.offEvent)
          webApp.offEvent('theme_changed', () => {})
      }
    } else {
      // Не в Telegram - показываем приложение сразу
      console.log(
        'Not in Telegram environment, showing app immediately'
      )
      setIsTelegram(false)
      setIsReady(true)
    }
  }, [])

  return {
    safeAreaInsets,
    isReady,
    isTelegram,
    theme,
    isExpanded,
    // CSS переменные для использования в стилях
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
