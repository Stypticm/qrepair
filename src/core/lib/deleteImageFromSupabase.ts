export const deleteImageFromSupabase = async (
  imageUrl: string
) => {
  try {
    // Отправляем через API роут вместо прямого доступа к Supabase
    const response = await fetch('/api/delete-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        error.message || 'Ошибка удаления изображения'
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}
