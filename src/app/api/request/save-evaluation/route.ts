import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      userEvaluation,
      damagePercent,
      price,
      priceRange,
      wearValues,
    } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Находим активную заявку пользователя
    const activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId,
        status: 'draft',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (!activeRequest) {
      console.log(
        '❌ No active request found for telegramId:',
        telegramId
      )
      return NextResponse.json(
        { error: 'No active request found' },
        { status: 404 }
      )
    }

    console.log('✅ Found active request:', {
      id: activeRequest.id,
      telegramId: activeRequest.telegramId,
      currentStep: activeRequest.currentStep,
      status: activeRequest.status,
    })

    // Обновляем заявку с данными оценки
    const updatedRequest = await prisma.skupka.update({
      where: { id: activeRequest.id },
      data: {
        userEvaluation: userEvaluation || null,
        damagePercent: damagePercent || 0,
        price: price || activeRequest.price,
        wearValues: wearValues || null,
        // Сохраняем priceRange в deviceConditions как JSON
        deviceConditions: priceRange
          ? {
              ...((activeRequest.deviceConditions as any) ||
                {}),
              priceRange: priceRange,
            }
          : activeRequest.deviceConditions,
        currentStep: 'submit',
        updatedAt: new Date(),
      },
    })

    console.log('✅ Evaluation saved:', {
      id: updatedRequest.id,
      telegramId,
      userEvaluation,
      damagePercent,
      price,
      currentStep: updatedRequest.currentStep,
    })

    return NextResponse.json({
      success: true,
      request: {
        id: updatedRequest.id,
        userEvaluation: updatedRequest.userEvaluation,
        damagePercent: updatedRequest.damagePercent,
        price: updatedRequest.price,
        currentStep: updatedRequest.currentStep,
      },
    })
  } catch (error) {
    console.error('Error saving evaluation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
