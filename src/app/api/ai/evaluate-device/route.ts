import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { requestId, photos, telegramId } =
      await req.json()

    if (!requestId || !photos || !telegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, что мастер существует
    const master = await prisma.master.findUnique({
      where: { telegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Проверяем, что заявка существует
    const request = await prisma.skupka.findUnique({
      where: { id: requestId },
    })

    if (!request) {
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
      finalPrice: Math.round(request.price! * 0.89), // Примерная финальная цена
      analysisDate: new Date().toISOString(),
      masterId: master.id,
    }

    // Сохраняем результат анализа в базу данных
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        aiAnalysis: analysisResult,
        photoUrls: photos, // Сохраняем ссылки на фото
      },
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
