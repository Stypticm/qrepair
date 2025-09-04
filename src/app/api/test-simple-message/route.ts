import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json({
        error: 'telegramId is required',
      })
    }

    console.log('Testing simple message to:', telegramId)

    // Отправляем простое текстовое сообщение
    await sendTelegramMessage(
      telegramId,
      '🧪 Тестовое сообщение без картинки'
    )

    return NextResponse.json({
      success: true,
      message: 'Simple message sent successfully',
    })
  } catch (error) {
    console.error('Error sending simple message:', error)
    return NextResponse.json(
      {
        error: 'Failed to send simple message',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
