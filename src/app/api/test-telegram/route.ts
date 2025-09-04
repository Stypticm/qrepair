import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, message } = await request.json()

    if (!telegramId || !message) {
      return NextResponse.json(
        { error: 'Missing telegramId or message' },
        { status: 400 }
      )
    }

    console.log('Testing Telegram message to:', telegramId)
    console.log(
      'BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )
    console.log('Message:', message)

    const result = await sendTelegramMessage(
      telegramId,
      message
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Test Telegram error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send test message',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
