import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const requestId = formData.get('requestId') as string

    if (!photo || !requestId) {
      return NextResponse.json(
        { error: 'Missing photo or requestId' },
        { status: 400 }
      )
    }

    // Загружаем фото в Supabase
    const photoUrl = await uploadImageToSupabase(photo)

    // TODO: Сохранить URL фото в базе данных для конкретной заявки
    // Пока что просто возвращаем URL

    return NextResponse.json({
      success: true,
      photoUrl,
      message: 'Фото успешно загружено',
    })
  } catch (error) {
    console.error('Error uploading master photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
