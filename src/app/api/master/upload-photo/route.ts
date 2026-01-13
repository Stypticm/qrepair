import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const requestId = formData.get('requestId') as string
    const photoType = formData.get('photoType') as string

    if (!photo || !requestId || !photoType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Загружаем фото в Supabase Storage и получаем публичный URL
    const photoUrl = await uploadImageToSupabase(photo)

    // Сохраняем URL фотографии в базе данных
    await prisma.skupka.update({
      where: { id: requestId },
      data: {
        photoUrls: {
          push: photoUrl,
        },
      },
    })

    return NextResponse.json({ success: true, photoUrl })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
