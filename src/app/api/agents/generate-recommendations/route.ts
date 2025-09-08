import { NextRequest, NextResponse } from 'next/server'
import { UXAnalyticsAgent } from '@/agents/UXAnalyticsAgent'

export async function POST(request: NextRequest) {
  try {
    const uxAgent = new UXAnalyticsAgent()

    // Принудительно генерируем рекомендации
    await uxAgent.analyzeAndRecommend()

    return NextResponse.json({
      success: true,
      message: 'Рекомендации сгенерированы успешно',
    })
  } catch (error) {
    console.error('Ошибка генерации рекомендаций:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка генерации рекомендаций',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
