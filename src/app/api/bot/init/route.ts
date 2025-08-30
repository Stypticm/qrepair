import { NextResponse } from 'next/server'
import { initializeBot } from '@/lib/bot'

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production') {
      await initializeBot()
      console.log('✅ Бот QoS инициализирован через API')
    }

    return NextResponse.json({
      success: true,
      message: 'Бот QoS инициализирован',
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
