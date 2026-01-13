import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, imageUrl, caption } =
      await request.json()

    if (!telegramId || !imageUrl) {
      return NextResponse.json({
        error: 'telegramId and imageUrl are required',
      })
    }

    console.log('=== SENDING PHOTO BY URL ===')
    console.log('Telegram ID:', telegramId)
    console.log('Image URL:', imageUrl)
    console.log('Caption:', caption || 'No caption')
    console.log(
      'BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )

    // Отправляем фото по URL в Telegram
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`

    const formData = new FormData()
    formData.append('chat_id', telegramId)
    formData.append('photo', imageUrl)
    if (caption) {
      formData.append('caption', caption)
    }

    console.log('Sending to Telegram API...')

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    console.log('Response status:', response.status)

    const data = await response.json()
    console.log('Telegram API response:', data)

    if (!data.ok) {
      console.error('Telegram API error:', data)
      return NextResponse.json({
        error: 'Telegram API error',
        details: data,
      })
    }

    console.log('Photo sent successfully!')
    console.log('========================')

    return NextResponse.json({
      success: true,
      message: 'Photo sent successfully',
      telegramResponse: data,
    })
  } catch (error) {
    console.error('Error sending photo by URL:', error)
    return NextResponse.json(
      {
        error: 'Failed to send photo',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
