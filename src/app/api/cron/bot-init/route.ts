import { NextResponse } from 'next/server'
import { initializeBot } from '@/lib/bot'

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') {
      await initializeBot()
      console.log('✅ Бот Qoqos инициализирован через cron')
    }

    return NextResponse.json({
      success: true,
      message: 'Бот Qoqos инициализирован через cron',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(
      '❌ Ошибка инициализации бота через cron:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка инициализации бота',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
