import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requestId,
      masterTelegramId,
      functionalityTests,
      finalPrice,
      totalPenalty,
      photoUrls,
    } = body

    if (
      !requestId ||
      !masterTelegramId ||
      !functionalityTests ||
      finalPrice === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Находим мастера по telegramId
    const master = await prisma.master.findUnique({
      where: { telegramId: masterTelegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Рассчитываем общий процент штрафа
    const totalPenaltyPercent = functionalityTests.reduce(
      (total: number, test: any) => {
        if (test.working !== null) {
          const shouldApplyPenalty = test.isNegative
            ? !test.working
            : test.working === false
          if (shouldApplyPenalty) {
            return total + test.penaltyPercent
          }
        }
        return total
      },
      0
    )

    // Обновляем заявку с результатами проверки
    await prisma.skupka.update({
      where: { id: requestId },
      data: {
        assignedMasterId: master.id,
        damagePercent: totalPenaltyPercent, // Сохраняем общий процент штрафа
        finalPrice, // Финальная цена после вычета штрафов
        inspectionCompleted: true,
        inspection: {
          functionalityTests,
          totalPenalty,
          totalPenaltyPercent,
          masterTelegramId,
          inspectedAt: new Date().toISOString(),
        },
        status: 'inspected',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Inspection saved successfully',
    })
  } catch (error) {
    console.error('Error saving inspection:', error)
    return NextResponse.json(
      { error: 'Failed to save inspection' },
      { status: 500 }
    )
  }
}
