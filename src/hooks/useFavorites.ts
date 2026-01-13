import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/authStore'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { telegramId } = useAppStore()

  // Загружаем избранное из localStorage при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites =
        localStorage.getItem('favorites')
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (error) {
          console.error('Error parsing favorites:', error)
        }
      }
    }
  }, [])

  // Сохраняем избранное в localStorage
  const saveFavorites = useCallback(
    (newFavorites: string[]) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'favorites',
          JSON.stringify(newFavorites)
        )
      }
    },
    []
  )

  // Добавляем в избранное
  const addToFavorites = useCallback(
    async (requestId: string) => {
      if (favorites.includes(requestId)) return

      setLoading(true)
      try {
        const newFavorites = [...favorites, requestId]
        setFavorites(newFavorites)
        saveFavorites(newFavorites)

        // Отправляем на сервер (для будущей интеграции с Telegram Cloud)
        if (telegramId) {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              requestId,
              action: 'add',
            }),
          })
        }
      } catch (error) {
        console.error('Error adding to favorites:', error)
      } finally {
        setLoading(false)
      }
    },
    [favorites, saveFavorites, telegramId]
  )

  // Удаляем из избранного
  const removeFromFavorites = useCallback(
    async (requestId: string) => {
      if (!favorites.includes(requestId)) return

      setLoading(true)
      try {
        const newFavorites = favorites.filter(
          (id) => id !== requestId
        )
        setFavorites(newFavorites)
        saveFavorites(newFavorites)

        // Отправляем на сервер
        if (telegramId) {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              requestId,
              action: 'remove',
            }),
          })
        }
      } catch (error) {
        console.error(
          'Error removing from favorites:',
          error
        )
      } finally {
        setLoading(false)
      }
    },
    [favorites, saveFavorites, telegramId]
  )

  // Переключаем состояние избранного
  const toggleFavorite = useCallback(
    async (requestId: string) => {
      if (favorites.includes(requestId)) {
        await removeFromFavorites(requestId)
      } else {
        await addToFavorites(requestId)
      }
    },
    [favorites, addToFavorites, removeFromFavorites]
  )

  // Проверяем, находится ли заявка в избранном
  const isFavorite = useCallback(
    (requestId: string) => {
      return favorites.includes(requestId)
    },
    [favorites]
  )

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  }
}
