import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, phoneData, step } = body

    if (!telegramId || !phoneData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ищем существующий запрос или создаем новый
    let requestRecord = await prisma.skupka.findFirst({
      where: { telegramId },
    })

    if (requestRecord) {
      // Обновляем существующий запрос
      requestRecord = await prisma.skupka.update({
        where: { id: requestRecord.id },
        data: {
          phoneData: phoneData,
          currentStep: step || 'phone_selection',
        },
      })
    } else {
      // Создаем новый запрос
      requestRecord = await prisma.skupka.create({
        data: {
          telegramId,
          username: 'Unknown', // Временно, потом заменим на реальное имя
          phoneData: phoneData,
          currentStep: step || 'phone_selection',
          status: 'draft',
        },
      })
    }

    return NextResponse.json({
      success: true,
      requestId: requestRecord.id,
      message: 'Progress saved successfully',
    })
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Missing telegramId' },
        { status: 400 }
      )
    }

    // Ищем сохраненный прогресс
    const requestRecord =
      await prisma.skupka.findFirst({
        where: { telegramId },
        select: {
          id: true,
          phoneData: true,
          currentStep: true,
          status: true,
        },
      })

    if (!requestRecord) {
      return NextResponse.json({
        success: false,
        message: 'No saved progress found',
      })
    }

    return NextResponse.json({
      success: true,
      data: requestRecord,
    })
  } catch (error) {
    console.error('Error loading progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
