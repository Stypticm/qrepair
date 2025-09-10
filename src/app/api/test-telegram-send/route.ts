import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: Request) {
  try {
    const { telegramId, message } = await request.json()

    if (!telegramId || !message) {
      return NextResponse.json(
        { error: 'telegramId and message are required' },
        { status: 400 }
      )
    }

    console.log(
      '🧪 Test Telegram Send - telegramId:',
      telegramId
    )
    console.log('🧪 Test Telegram Send - message:', message)
    console.log(
      '🧪 Test Telegram Send - BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )

    try {
      const result = await sendTelegramMessage(
        telegramId,
        message,
        { parse_mode: 'Markdown' }
      )

      console.log(
        '✅ Test Telegram Send - Success:',
        result
      )

      return NextResponse.json({
        success: true,
        result,
        message: 'Message sent successfully',
      })
    } catch (telegramError) {
      console.error(
        '❌ Test Telegram Send - Error:',
        telegramError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            telegramError instanceof Error
              ? telegramError.message
              : 'Unknown error',
          details: telegramError,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in test-telegram-send API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
