import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { telegramId, additionalConditions } = await request.json()

    console.log(
      'saveAdditionalConditions: telegramId =',
      telegramId,
      'additionalConditions =',
      JSON.stringify(additionalConditions, null, 2)
    )

    if (!telegramId || !additionalConditions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Находим активную заявку пользователя
    const currentRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      select: { additionalConditions: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Active request not found' },
        { status: 404 }
      )
    }

    // Объединяем существующие условия с новыми
    const existingConditions = 
      (currentRequest?.additionalConditions as Record<
        string,
        string | null
      >) || {}

    const mergedConditions = {
      ...existingConditions,
      ...additionalConditions,
    }

    console.log('Обновляем дополнительные условия:', mergedConditions)

    // Обновляем заявку с новыми дополнительными условиями
    const updatedRequest = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: {
        additionalConditions: mergedConditions,
      },
    })

    console.log(
      'Дополнительные условия успешно сохранены:',
      updatedRequest.count,
      'записей обновлено'
    )

    return NextResponse.json({
      success: true,
      additionalConditions: mergedConditions,
    })
  } catch (error) {
    console.error('Error saving additional conditions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
