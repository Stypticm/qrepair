import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { telegramId, additionalConditions, currentStep } =
      await request.json()

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
      orderBy: { createdAt: 'desc' },
    })

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Active request not found' },
        { status: 404 }
      )
    }

    // Полностью заменяем существующие условия новыми
    const mergedConditions = additionalConditions

    // Обновляем заявку с новыми дополнительными условиями
    const updatedRequest = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: {
        additionalConditions: mergedConditions,
        currentStep: currentStep || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      additionalConditions: mergedConditions,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}