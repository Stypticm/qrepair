'use client'

import { useState, useEffect } from 'react'

export function useChatContext() {
  const [isChatContext, setIsChatContext] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      
      // Определяем контекст запуска
      const determineContext = () => {
        // Проверяем различные признаки контекста чата
        const hasChatData = webApp.initDataUnsafe?.chat
        const hasStartParam = webApp.initDataUnsafe?.start_param
        const viewportHeight = webApp.viewportHeight
        const isExpanded = webApp.isExpanded
        
        // Если есть данные чата или start_param, вероятно запуск из чата
        if (hasChatData || hasStartParam) {
          setIsChatContext(true)
          console.log('Detected chat context launch')
        } else {
          setIsChatContext(false)
          console.log('Detected external launch')
        }
        
        console.log('Context detection:', {
          hasChatData: !!hasChatData,
          hasStartParam: !!hasStartParam,
          viewportHeight,
          isExpanded,
          chatData: hasChatData,
          startParam: hasStartParam
        })
      }

      // Определяем контекст при инициализации
      determineContext()

      // Слушаем изменения viewport для обновления контекста
      if (webApp.onViewportChanged) {
        webApp.onViewportChanged((event) => {
          // Если viewport не развернут, возможно это контекст чата
          if (event.is_expanded !== undefined && !event.is_expanded) {
            setIsChatContext(true)
            console.log('Viewport suggests chat context')
          }
        })
      }
    }
  }, [isMounted])

  return {
    isChatContext,
    isMounted
  }
}
