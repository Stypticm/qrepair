import { v4 as uuidv4 } from 'uuid'

export const uploadImageToSupabase = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`

  // Создаём FormData для отправки файла
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', fileName)

  // Отправляем через API роут вместо прямого доступа к Supabase
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(
      error.message || 'Ошибка загрузки изображения'
    )
  }

  const { publicUrl } = await response.json()
  return publicUrl
}
