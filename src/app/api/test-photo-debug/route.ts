import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json({
        error: 'telegramId is required',
      })
    }

    console.log('=== PHOTO DEBUG TEST ===')
    console.log('Testing photo send to:', telegramId)
    console.log(
      'BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )
    console.log(
      'BOT_TOKEN length:',
      process.env.BOT_TOKEN?.length || 0
    )

    // Проверяем файл
    const filePath = path.join(
      process.cwd(),
      'public',
      'submit.png'
    )
    console.log('File path:', filePath)
    console.log('File exists:', fs.existsSync(filePath))

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        error: 'File not found: ' + filePath,
      })
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath)
    console.log('File size:', fileBuffer.length, 'bytes')
    console.log('File type:', typeof fileBuffer)

    // Создаем FormData
    const formData = new FormData()
    formData.append('chat_id', telegramId)
    formData.append(
      'photo',
      new Blob([fileBuffer], { type: 'image/png' }),
      'submit.png'
    )
    formData.append(
      'caption',
      '🧪 Тестовое фото для отладки'
    )

    console.log('FormData created')
    console.log(
      'FormData has photo:',
      formData.has('photo')
    )
    console.log(
      'FormData has chat_id:',
      formData.has('chat_id')
    )
    console.log(
      'FormData has caption:',
      formData.has('caption')
    )

    // Отправляем в Telegram
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`
    console.log('Sending to URL:', url)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    console.log('Response status:', response.status)
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    )

    const data = await response.json()
    console.log('Response data:', data)

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
    console.error('Error in photo debug test:', error)
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
