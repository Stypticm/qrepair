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

      // Проверяем результат через небольшую паузу
      setTimeout(() => {
        if (!webApp.isExpanded) {
          console.log(
            'First expand failed, trying again...'
          )
          webApp.expand()
        }
      }, 200)
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

      // Инициализация и расширение как в BotFather
      const setup = async () => {
        try {
          // Сначала уведомляем Telegram о готовности
          webApp.ready()

          // Ждем небольшую паузу для полной инициализации
          await new Promise((resolve) =>
            setTimeout(resolve, 100)
          )

          // Принудительно разворачиваем на весь экран
          // Это ключевой момент - вызываем expand() после ready()
          webApp.expand()

          // Дополнительно принудительно разворачиваем через небольшую паузу
          // для случаев, когда первый вызов не сработал
          setTimeout(() => {
            if (!webApp.isExpanded) {
              console.log('Force expanding again...')
              webApp.expand()
            }
          }, 300)

          // Дополнительная попытка расширения для контекста чата
          // Telegram может применять разные правила для разных контекстов
          setTimeout(() => {
            console.log(
              'Final expand attempt for chat context...'
            )
            webApp.expand()

            // Принудительно устанавливаем viewport
            if (
              webApp.viewportHeight &&
              webApp.viewportStableHeight
            ) {
              console.log(
                'Viewport height:',
                webApp.viewportHeight
              )
              console.log(
                'Stable height:',
                webApp.viewportStableHeight
              )
            }
          }, 500)

          // Включаем подтверждение закрытия
          if (webApp.enableClosingConfirmation) {
            webApp.enableClosingConfirmation()
          }

          // Устанавливаем цвета для лучшего UX
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

      // Обработчики изменений viewport
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          console.log('Viewport changed:', event)
          updateSafeArea()

          // Проверяем, развернуто ли приложение
          if (event.is_expanded !== undefined) {
            setIsExpanded(event.is_expanded)

            // Если не развернуто, пытаемся развернуть снова
            if (!event.is_expanded) {
              console.log(
                'Viewport not expanded, trying to expand again...'
              )
              setTimeout(() => webApp.expand(), 100)
            }
          }

          // Логируем детали viewport для отладки
          console.log('Viewport details:', {
            height: event.height,
            width: event.width,
            is_expanded: event.is_expanded,
            is_state_stable: event.is_state_stable,
          })
        })
      }
      // Альтернативный способ через onEvent
      if (webApp.onEvent) {
        webApp.onEvent('viewport_changed', (event: any) => {
          console.log(
            'Viewport changed via onEvent:',
            event
          )
          updateSafeArea()
        })
      }

      // Обработчик изменения темы
      if (webApp.onEvent) {
        webApp.onEvent('theme_changed', () => {
          if (webApp.colorScheme) {
            setTheme(webApp.colorScheme)
          }
        })
      }

      // Обработчик закрытия приложения
      if (webApp.onCloseRequested) {
        webApp.onCloseRequested(() => {
          console.log('App close requested')
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
        if (webApp.offCloseRequested)
          webApp.offCloseRequested(() => {})
      }
    } else {
      // Не в Telegram - показываем приложение сразу
      console.log(
        'Not in Telegram environment, showing app immediately'
      )
      setIsTelegram(false)
      setIsReady(true)
    }
  }, [isMounted])

  // Не рендерим ничего до монтирования
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
      forceExpand: () => {},
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
    // CSS переменные для использования в стилях
    cssVars: {
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
    },
  }
}
