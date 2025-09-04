import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json({
        error: 'telegramId is required',
      })
    }

    const BOT_TOKEN = process.env.BOT_TOKEN
    if (!BOT_TOKEN) {
      return NextResponse.json({
        error: 'BOT_TOKEN is not defined',
      })
    }

    console.log('=== TELEGRAM DEBUG TEST ===')
    console.log('TelegramId:', telegramId)
    console.log('BOT_TOKEN exists:', !!BOT_TOKEN)
    console.log('BOT_TOKEN length:', BOT_TOKEN.length)
    console.log(
      'BOT_TOKEN preview:',
      BOT_TOKEN.substring(0, 10) + '...'
    )

    // Тестируем простой запрос к Telegram API
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    const message =
      '🧪 Тест с сервера: ' + new Date().toISOString()

    console.log('Sending to URL:', url)
    console.log('Message:', message)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
      }),
    })

    const data = await response.json()
    console.log('Telegram API response:', data)

    if (!data.ok) {
      return NextResponse.json({
        success: false,
        error: 'Telegram API error',
        details: data,
        url: url,
        message: message,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram message sent successfully',
      response: data,
    })
  } catch (error) {
    console.error('Error in telegram debug test:', error)
    return NextResponse.json(
      {
        error: 'Failed to send telegram message',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
