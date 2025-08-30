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
  // Можно переопределить базу через переменную окружения, если нужно
  const override = process.env.NEXT_PUBLIC_PICTURES_BASE
  const base = override || getSupabasePublicBase('pictures')
  if (!base) return ''
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
