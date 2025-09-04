import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, feedback, modelname, price } =
      await request.json()

    if (!telegramId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Testing feedback submission:', {
      telegramId,
      feedback,
      modelname,
      price,
    })

    // Создаем тестовую заявку с feedback
    const testSkupka = await prisma.skupka.create({
      data: {
        telegramId: telegramId,
        username: telegramId,
        modelname: modelname || 'Test iPhone 11 Pro',
        price: price || 48000,
        feedback: feedback.trim(),
        priceAgreed: false,
        status: 'submitted',
        submittedAt: new Date(),
        photoUrls: [],
      },
    })

    console.log('Test skupka created:', testSkupka.id)

    return NextResponse.json({
      success: true,
      skupka: testSkupka,
      message: 'Test feedback saved successfully',
    })
  } catch (error) {
    console.error('Error testing feedback:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Получаем последние заявки с feedback для тестирования
    const recentFeedback = await prisma.skupka.findMany({
      where: {
        feedback: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        telegramId: true,
        username: true,
        modelname: true,
        price: true,
        feedback: true,
        priceAgreed: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      feedback: recentFeedback,
      count: recentFeedback.length,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
