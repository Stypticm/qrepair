import { useState, useEffect, useCallback } from 'react'
import {
  getTelegramCloudImage,
  preloadImagesToTelegramCloud,
} from '@/core/lib/assets'

export function useTelegramCloudImages() {
  const [isCloudAvailable, setIsCloudAvailable] =
    useState(false)
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)

  // Проверяем доступность Telegram Cloud Storage
  useEffect(() => {
    if (typeof window !== 'undefined') { // Updated check
      const webApp = (window as any).Telegram?.WebApp;
      // CloudStorage was introduced in Bot API 6.9
      const isSupportedVersion = webApp?.isVersionAtLeast ? webApp.isVersionAtLeast('6.9') : false;
      const hasCloudStorage = isSupportedVersion && webApp?.CloudStorage !== undefined;

      setIsCloudAvailable(hasCloudStorage)

      if (hasCloudStorage) {
        console.log(
          '✅ Telegram Cloud Storage доступен для изображений'
        )
        // Автоматически предзагружаем изображения
        preloadImages()
      } else {
        console.log(
          '⚠️ Telegram Cloud Storage недоступен, используем локальные файлы'
        )
      }
    }
  }, [])

  // Предзагружаем изображения в Cloud Storage
  const preloadImages = useCallback(async () => {
    if (!isCloudAvailable) return

    setIsPreloading(true)
    setPreloadProgress(0)

    try {
      await preloadImagesToTelegramCloud()
      setPreloadProgress(100)
      console.log(
        '✅ Все изображения предзагружены в Telegram Cloud Storage'
      )
    } catch (error) {
      console.error(
        'Ошибка предзагрузки изображений:',
        error
      )
    } finally {
      setIsPreloading(false)
    }
  }, [isCloudAvailable])

  // Получаем изображение с приоритетом Cloud Storage
  const getImage = useCallback((fileName: string) => {
    return getTelegramCloudImage(fileName)
  }, [])

  return {
    isCloudAvailable,
    isPreloading,
    preloadProgress,
    getImage,
    preloadImages,
  }
}
