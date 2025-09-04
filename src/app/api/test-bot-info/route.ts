import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN
    if (!BOT_TOKEN) {
      return NextResponse.json({
        error: 'BOT_TOKEN is not defined',
      })
    }

    // Получаем информацию о боте
    const botInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    const botInfoResponse = await fetch(botInfoUrl)
    const botInfo = await botInfoResponse.json()

    // Получаем информацию о webhook
    const webhookInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    const webhookInfoResponse = await fetch(webhookInfoUrl)
    const webhookInfo = await webhookInfoResponse.json()

    return NextResponse.json({
      botInfo,
      webhookInfo,
      success: true,
    })
  } catch (error) {
    console.error('Error getting bot info:', error)
    return NextResponse.json(
      { error: 'Failed to get bot info' },
      { status: 500 }
    )
  }
}
