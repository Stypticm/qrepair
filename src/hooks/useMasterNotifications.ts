import { useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useNotifications } from './useNotifications'

export function useMasterNotifications() {
  const { telegramId } = useAppStore()
  const { showNotification } = useNotifications()

  useEffect(() => {
    if (!telegramId) return

    // Проверяем, есть ли уведомления о изменении точки
    const checkPointChanges = () => {
      const lastCheck = localStorage.getItem(
        `lastPointCheck_${telegramId}`
      )
      const currentTime = Date.now()

      // Проверяем каждые 30 секунд
      if (
        !lastCheck ||
        currentTime - parseInt(lastCheck) > 30000
      ) {
        localStorage.setItem(
          `lastPointCheck_${telegramId}`,
          currentTime.toString()
        )

        // Здесь можно добавить API вызов для проверки изменений точки
        // Пока что это заглушка
        const hasChanges = Math.random() > 0.8 // 20% вероятность уведомления для демо

        if (hasChanges) {
          showNotification(
            '📍 Ваша рабочая точка была изменена',
            'info'
          )
        }
      }
    }

    // Проверяем сразу при загрузке
    checkPointChanges()

    // Устанавливаем интервал для проверки
    const interval = setInterval(checkPointChanges, 30000)

    return () => clearInterval(interval)
  }, [telegramId, showNotification])

  return {
    // Можно добавить дополнительные методы для уведомлений
  }
}
