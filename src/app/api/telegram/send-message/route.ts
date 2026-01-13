import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, message } = body

    if (!telegramId || !message) {
      return NextResponse.json(
        { error: 'Missing telegramId or message' },
        { status: 400 }
      )
    }

    // Отправляем сообщение в Telegram
    await sendTelegramMessage(telegramId, message, {
      parse_mode: 'Markdown',
    })

    return NextResponse.json({
      success: true,
      message: 'Сообщение отправлено в Telegram',
    })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
