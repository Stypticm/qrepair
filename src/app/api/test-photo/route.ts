import { NextRequest, NextResponse } from 'next/server'
import {
  sendTelegramPhoto,
  sendTelegramMessage,
} from '@/core/lib/sendTelegramMessage'
import { getServerImageUrl } from '@/core/lib/assets'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Missing telegramId' },
        { status: 400 }
      )
    }

    console.log('Testing photo send to:', telegramId)
    console.log(
      'NEXT_PUBLIC_USE_SUPABASE_IMAGES:',
      process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES
    )

    // Тестируем с публичным URL сначала
    const publicImageUrl =
      'https://via.placeholder.com/400x200/2dc2c6/ffffff?text=Test+Image'

    // Затем пробуем наш PNG URL с абсолютным путем (для серверной среды)
    const submitImageUrl = getServerImageUrl('submit.png')

    console.log('=== DEBUG INFO ===')
    console.log(
      'NEXT_PUBLIC_USE_SUPABASE_IMAGES:',
      process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES
    )
    console.log(
      'NEXT_PUBLIC_SUPABASE_URL:',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    )
    console.log(
      'NEXT_PUBLIC_PICTURES_BASE:',
      process.env.NEXT_PUBLIC_PICTURES_BASE
    )
    console.log(
      'NEXT_PUBLIC_BASE_URL:',
      process.env.NEXT_PUBLIC_BASE_URL
    )
    console.log('getPictureUrl result:', submitImageUrl)
    console.log('==================')

    try {
      // Сначала пробуем публичную картинку
      console.log('Trying public image first...')
      await sendTelegramPhoto(
        telegramId,
        publicImageUrl,
        '🧪 Тест с публичной картинкой'
      )

      return NextResponse.json({
        success: true,
        message: 'Public photo sent successfully',
        imageUrl: publicImageUrl,
      })
    } catch (publicError) {
      console.error('Public photo failed:', publicError)

      try {
        // Затем пробуем нашу картинку
        console.log('Trying our image...')
        await sendTelegramPhoto(
          telegramId,
          submitImageUrl,
          '🧪 Тест с нашей картинкой'
        )

        return NextResponse.json({
          success: true,
          message: 'Our photo sent successfully',
          imageUrl: submitImageUrl,
        })
      } catch (ourError) {
        console.error('Our photo failed:', ourError)

        // Fallback: отправляем обычное сообщение
        await sendTelegramMessage(
          telegramId,
          '🧪 Тестовое сообщение без картинки (fallback)'
        )

        return NextResponse.json({
          success: true,
          message:
            'Both photos failed, sent text message instead',
          errors: {
            public:
              publicError instanceof Error
                ? publicError.message
                : 'Unknown error',
            our:
              ourError instanceof Error
                ? ourError.message
                : 'Unknown error',
          },
          imageUrls: {
            public: publicImageUrl,
            our: submitImageUrl,
          },
        })
      }
    }
  } catch (error) {
    console.error('Test photo error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
