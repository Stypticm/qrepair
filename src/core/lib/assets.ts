export function getSupabasePublicBase(
  bucket: string
): string {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl) return ''
  const url = new URL(supabaseUrl)
  return `${url.origin}/storage/v1/object/public/${bucket}`
}

/**
 * СТРАТЕГИЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ:
 *
 * 1. СТАТИЧЕСКИЕ ИЗОБРАЖЕНИЯ (лоадеры, логотипы, состояния):
 *    - Источник: Supabase storage/pictures (приоритет)
 *    - Fallback: локальные файлы (/public)
 *    - Кэширование: Telegram Cloud Storage (если доступен)
 *
 * 2. ФОТО УСТРОЙСТВ (photoUrls):
 *    - Источник: БД (Supabase) - это фото пользователей
 *    - Обработка: как есть, без изменений
 *    - Fallback: placeholder изображение
 *
 * 3. ПРИОРИТЕТЫ:
 *    - Supabase storage/pictures
 *    - Локальные файлы (/public)
 *    - Placeholder изображения
 */

export function getPictureUrl(fileName: string): string {
  // Проверяем доступность Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    // Используем Supabase storage для изображений
    return `${supabaseUrl}/storage/v1/object/public/pictures/${fileName}`
  }

  // Fallback на локальные файлы
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/${fileName}`
  }

  // В серверной среде используем NEXT_PUBLIC_BASE_URL или fallback
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  return `${baseUrl}/${fileName}`
}

// Функция для получения URL изображения с fallback на локальные файлы
export function getImageUrl(fileName: string): string {
  const supabaseUrl = getPictureUrl(fileName)
  if (supabaseUrl) return supabaseUrl

  // Fallback на локальные файлы в папке public
  return `/${fileName}`
}

export function getStatusImage(name: string): string {
  return getPictureUrl(`status/${name}.png`)
}

// Функция для получения абсолютного URL изображения для серверной среды (API routes)
export function getServerImageUrl(
  fileName: string
): string {
  // Для серверной среды используем NEXT_PUBLIC_BASE_URL или fallback
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  return `${baseUrl}/${fileName}`
}
export function getTelegramCloudImage(
  fileName: string
): string {
  // Для GIF файлов всегда используем прямые ссылки (Cloud Storage может терять анимацию)
  if (fileName.endsWith('.gif')) {
    return getPictureUrl(fileName)
  }

  // Проверяем доступность Telegram Cloud Storage
  if (
    typeof window !== 'undefined' &&
    (window as any).Telegram?.WebApp?.CloudStorage
  ) {
    try {
      // Получаем изображение из Cloud Storage
      const cloudStorage = (window as any).Telegram.WebApp
        .CloudStorage
      const imageData = cloudStorage.getItem(
        `image_${fileName}`
      )

      if (imageData) {
        // Если изображение в base64, возвращаем data URL
        if (imageData.startsWith('data:')) {
          return imageData
        }
        // Если это URL, возвращаем как есть
        return imageData
      }
    } catch (error) {
      console.warn(
        'Error accessing Telegram Cloud Storage:',
        error
      )
    }
  }

  // Fallback на локальные файлы
  return getPictureUrl(fileName)
}

// Функция для загрузки изображения в Telegram Cloud Storage
export async function uploadImageToTelegramCloud(
  fileName: string,
  imageData: string
): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    (window as any).Telegram?.WebApp?.CloudStorage
  ) {
    try {
      const cloudStorage = (window as any).Telegram.WebApp
        .CloudStorage
      cloudStorage.setItem(`image_${fileName}`, imageData)
      return true
    } catch (error) {
      console.error(
        'Error uploading to Telegram Cloud Storage:',
        error
      )
      return false
    }
  }
  return false
}

// Функция для предзагрузки всех изображений в Telegram Cloud Storage
export async function preloadImagesToTelegramCloud(): Promise<void> {
  const images = [
    'animation_running.gif',
    'animation_logo2.gif',
    'display_front_new.png',
    'display_front.png',
    'display_front_have_scratches.png',
    'display_front_scratches.png',
  ]

  for (const imageName of images) {
    try {
      // Загружаем изображение как base64
      const response = await fetch(getPictureUrl(imageName))
      if (response.ok) {
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const base64Data = reader.result as string
          uploadImageToTelegramCloud(imageName, base64Data)
        }
        reader.readAsDataURL(blob)
      }
    } catch (error) {
      console.warn(`Failed to preload ${imageName}:`, error)
    }
  }
}
