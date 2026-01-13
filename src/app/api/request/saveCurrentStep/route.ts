import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { telegramId, currentStep } = await request.json()

    if (!telegramId || !currentStep) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Обновляем текущий шаг в активной заявке
    const updatedRequest = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: {
        currentStep: currentStep,
      },
    })

    if (updatedRequest.count === 0) {
      return NextResponse.json(
        { error: 'Active request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      currentStep: currentStep,
    })
  } catch (error) {
    console.error('Error saving current step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
