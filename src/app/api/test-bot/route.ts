import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const botToken = process.env.BOT_TOKEN
    const hasBotToken = !!botToken

    console.log(
      '🔍 Test Bot API - BOT_TOKEN exists:',
      hasBotToken
    )
    console.log(
      '🔍 Test Bot API - BOT_TOKEN length:',
      botToken?.length || 0
    )
    console.log(
      '🔍 Test Bot API - BOT_TOKEN starts with:',
      botToken?.substring(0, 10) || 'N/A'
    )

    return NextResponse.json({
      hasBotToken,
      tokenLength: botToken?.length || 0,
      tokenPreview:
        botToken?.substring(0, 10) + '...' || 'N/A',
      allEnvVars: Object.keys(process.env).filter(
        (key) =>
          key.includes('BOT') || key.includes('TELEGRAM')
      ),
    })
  } catch (error) {
    console.error('Error in test-bot API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
