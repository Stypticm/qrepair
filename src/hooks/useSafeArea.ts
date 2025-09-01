'use client'

import { useState, useEffect, useCallback } from 'react'

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
  const [isMounted, setIsMounted] = useState(false)

  // Функция для принудительного расширения
  const forceExpand = useCallback(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      console.log('Force expanding WebApp...')
      webApp.expand()

      // Проверяем результат через 100ms и повторяем, если не развернуто
      setTimeout(() => {
        if (!webApp.isExpanded) {
          console.log(
            'First expand failed, trying again...'
          )
          webApp.expand()
        }
      }, 100)
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

      const setup = async () => {
        try {
          // Уведомляем Telegram о готовности
          webApp.ready()

          // Проверяем, открыто ли через Menu Button
          const isMenuButton =
            !webApp.initDataUnsafe?.start_param
          console.log('Is Menu Button:', isMenuButton)

          // Принудительно разворачиваем на весь экран
          webApp.expand()

          // Агрессивное расширение для Menu Button
          if (isMenuButton) {
            console.log(
              'Menu Button detected, forcing full screen...'
            )
            const expandSequence = [100, 300, 500]
            expandSequence.forEach((delay) => {
              setTimeout(() => {
                if (!webApp.isExpanded) {
                  console.log(
                    `Expand attempt at ${delay}ms...`
                  )
                  webApp.expand()
                }
              }, delay)
            })
          }

          // Устанавливаем цвета
          webApp.headerColor = '#2dc2c6'
          webApp.backgroundColor = '#ffffff'

          // Получаем тему
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }

          // Проверяем статус расширения
          if (webApp.isExpanded !== undefined) {
            setIsExpanded(webApp.isExpanded)
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
          console.log('Viewport changed:', event)
          setIsExpanded(event.is_expanded || false)

          // Если не развернуто, пытаемся снова
          if (!event.is_expanded) {
            console.log(
              'Viewport not expanded, retrying...'
            )
            setTimeout(() => webApp.expand(), 100)
            setTimeout(() => webApp.expand(), 300)
          }
        })
      }

      // Обработчик темы
      if (webApp.onEvent) {
        webApp.onEvent('theme_changed', () => {
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }
        })
      }

      // Очистка
      return () => {
        if (webApp.offViewportChanged)
          webApp.offViewportChanged(() => {})
        if (webApp.offEvent)
          webApp.offEvent('theme_changed', () => {})
      }
    } else {
      console.log(
        'Not in Telegram environment, showing app immediately'
      )
      setIsTelegram(false)
      setIsReady(true)
    }
  }, [isMounted])

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
      isExpanded: false,
      forceExpand,
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
    isExpanded,
    forceExpand,
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
