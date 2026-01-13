'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/authStore'

interface UseDraftSaveOptions {
  step: string
  data?: any
  delay?: number // Задержка перед сохранением в мс
}

export function useDraftSave({
  step,
  data,
  delay = 2000,
}: UseDraftSaveOptions) {
  const { telegramId, username } = useAppStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const saveDraft = useCallback(
    async (draftData: any) => {
      if (!telegramId) return

      try {
        const response = await fetch(
          '/api/request/saveDraft',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId,
              username,
              currentStep: step,
              ...draftData,
            }),
          }
        )

        if (response.ok) {
          const result = await response.json()
          // Сохраняем ID запроса для последующих обновлений
          if (result.requestId) {
            sessionStorage.setItem(
              'currentRequestId',
              result.requestId
            )
          }
          console.log('Черновик сохранён:', result)
        }
      } catch (error) {
        console.error(
          'Ошибка при сохранении черновика:',
          error
        )
      }
    },
    [telegramId, username, step]
  )

  // Автоматическое сохранение с задержкой
  useEffect(() => {
    if (!data) return

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      saveDraft(data)
    }, delay)

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, saveDraft, delay])

  // Ручное сохранение
  const saveNow = useCallback(() => {
    if (data) {
      saveDraft(data)
    }
  }, [data, saveDraft])

  return { saveNow }
}

// Хук для восстановления черновика
export function useDraftRestore() {
  const { telegramId } = useAppStore()

  const restoreDraft = useCallback(async () => {
    if (!telegramId) return null

    try {
      const response = await fetch(
        `/api/request/saveDraft?telegramId=${telegramId}`
      )

      if (response.ok) {
        const result = await response.json()
        return result.draft
      }
    } catch (error) {
      console.error(
        'Ошибка при восстановлении черновика:',
        error
      )
    }

    return null
  }, [telegramId])

  return { restoreDraft }
}
