import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'
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

    console.log('Testing photo file send to:', telegramId)

    const BOT_TOKEN = process.env.BOT_TOKEN
    if (!BOT_TOKEN) {
      return NextResponse.json({
        error: 'BOT_TOKEN is not defined',
      })
    }

    // Путь к файлу
    const filePath = path.join(
      process.cwd(),
      'public',
      'submit.png'
    )
    console.log('File path:', filePath)

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        error: 'File not found: ' + filePath,
      })
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath)
    console.log('File size:', fileBuffer.length, 'bytes')

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
      '🧪 Тест отправки файла напрямую'
    )

    // Отправляем в Telegram
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`
    console.log('Sending to Telegram API:', url)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log('Telegram API response:', data)

    if (!data.ok) {
      return NextResponse.json({
        success: false,
        error: 'Telegram API error',
        details: data,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Photo file sent successfully',
      fileSize: fileBuffer.length,
    })
  } catch (error) {
    console.error('Error sending photo file:', error)
    return NextResponse.json(
      {
        error: 'Failed to send photo file',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
