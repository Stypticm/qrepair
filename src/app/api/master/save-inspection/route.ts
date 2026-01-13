import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requestId,
      masterTelegramId,
      functionalityTests = [],
      finalPrice,
      totalPenalty = 0,
      photoUrls,
      priceRange,
      snVerification,
    } = body

    if (!requestId || !masterTelegramId || finalPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const normalizedTests = Array.isArray(functionalityTests)
      ? functionalityTests
      : []

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
    const totalPenaltyPercent = normalizedTests.reduce(
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
          functionalityTests: normalizedTests,
          totalPenalty,
          totalPenaltyPercent,
          masterTelegramId,
          inspectedAt: new Date().toISOString(),
          priceRange: priceRange ?? null,
          snVerification: snVerification ?? null,
          photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
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
