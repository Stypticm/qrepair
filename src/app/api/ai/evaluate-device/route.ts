import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function POST(req: NextRequest) {
  try {
    const {
      requestId,
      photos,
      telegramId,
      videoUrls,
      aiModelUsed,
      analysisConfidence,
      priceRange,
    } = await req.json()

    if (!requestId || !photos || !telegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, что мастер существует
    const masters = await api.list<any>('masters', { telegramId })
    const master = masters && masters.length > 0 ? masters[0] : null

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Проверяем, что заявка существует
    const skupkaRequest = await api.get<any>('skupkas', requestId)

    if (!skupkaRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Имитация ИИ-анализа (заглушка)
    const analysisResult = {
      front: {
        condition: 'Заметные царапины',
        damagePercent: 8,
        description: 'Небольшие царапины на экране',
      },
      back: {
        condition: 'Очень хорошее',
        damagePercent: 3,
        description: 'Минимальные следы использования',
      },
      side: {
        condition: 'Новый',
        damagePercent: 0,
        description: 'Отличное состояние',
      },
      finalPrice: Math.round((skupkaRequest.price || 0) * 0.89),
      analysisDate: new Date().toISOString(),
      masterId: master.id,
    }

    // Сохраняем результат анализа в базу данных
    const updatedRequest = await api.patch<any>('skupkas', requestId, {
      aiAnalysis: analysisResult,
      photoUrls: photos,
      videoUrls: Array.isArray(videoUrls) ? videoUrls : undefined,
      aiModelUsed: aiModelUsed || undefined,
      analysisConfidence: typeof analysisConfidence === 'number' ? analysisConfidence : undefined,
      priceRange: priceRange || undefined,
    })

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error evaluating device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
