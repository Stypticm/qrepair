import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Конвертируем файл в base64 для простоты (в продакшене лучше использовать S3 или подобный сервис)
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const photoUrl = `data:${photo.type};base64,${base64}`

    // Сохраняем URL фотографии в базе данных
    await prisma.skupka.update({
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
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
