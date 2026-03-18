import { NextResponse } from 'next/server'
import { initializeBot } from '@/lib/bot'

export async function POST() {
  try {
    // Инициализируем только если есть реальный токен (пропускаем во время билда без секретов)
    if (process.env.NODE_ENV === 'production' && process.env.BOT_TOKEN && !process.env.BOT_TOKEN.includes('AAA')) {
      await initializeBot()
      console.log('✅ Бот Qoqos инициализирован через API')
    }

    return NextResponse.json({
      success: true,
      message: 'Бот Qoqos инициализирован',
    })
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка инициализации бота',
      },
      { status: 500 }
    )
  }
}
