import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase'
import prisma from '@/core/lib/prisma'

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

    // Сохраняем URL фото в базе данных для конкретной заявки
    const updatedSkupka = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        photoUrls: {
          push: photoUrl,
        },
      },
    })

    return NextResponse.json({
      success: true,
      photoUrl,
      message: 'Фото успешно загружено и сохранено',
      skupka: updatedSkupka,
    })
  } catch (error) {
    console.error('Error uploading master photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
