export function getSupabasePublicBase(
  bucket: string
): string {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl) return ''
  const url = new URL(supabaseUrl)
  return `${url.origin}/storage/v1/object/public/${bucket}`
}

export function getPictureUrl(fileName: string): string {
  // По умолчанию используем локальные файлы для ускорения загрузки
  // Можно переопределить через переменную окружения, если нужно использовать Supabase
  const useSupabase =
    process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES === 'true'

  if (!useSupabase) {
    // В клиентской среде используем window.location.origin
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/${fileName}`
    }

    // В серверной среде используем NEXT_PUBLIC_BASE_URL или fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
    return `${baseUrl}/${fileName}`
  }

  // Можно переопределить базу через переменную окружения, если нужно
  const override = process.env.NEXT_PUBLIC_PICTURES_BASE
  const base = override || getSupabasePublicBase('pictures')
  if (!base) {
    // Fallback на локальные файлы с абсолютным URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
    return `${baseUrl}/${fileName}`
  }

  return `${base}/${fileName}`
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
  const useSupabase =
    process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES === 'true'

  if (!useSupabase) {
    // Для серверной среды используем NEXT_PUBLIC_BASE_URL или fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
    return `${baseUrl}/${fileName}`
  }

  // Если используется Supabase
  const override = process.env.NEXT_PUBLIC_PICTURES_BASE
  const base = override || getSupabasePublicBase('pictures')
  if (!base) {
    // Fallback на локальные файлы с абсолютным URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
    return `${baseUrl}/${fileName}`
  }

  return `${base}/${fileName}`
}
