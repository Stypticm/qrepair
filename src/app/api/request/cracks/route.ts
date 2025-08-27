import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const { telegramId, cracks } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку по telegramId
    const existingRequest = await prisma.skupka.findFirst({
      where: { telegramId },
    })

    let updatedRequest
    if (existingRequest) {
      // Обновляем существующую заявку
      updatedRequest = await prisma.skupka.update({
        where: { id: existingRequest.id },
        data: {
          cracks: cracks,
          updatedAt: new Date(),
        },
      })
    } else {
      // Создаем новую заявку
      updatedRequest = await prisma.skupka.create({
        data: {
          telegramId,
          username: 'user', // Временное значение
          cracks: cracks,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      cracks: cracks,
    })
  } catch (error) {
    console.error('Error updating cracks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

    const skupkaRequest = await prisma.skupka.findFirst({
      where: { telegramId },
    })

    return NextResponse.json({
      cracks: skupkaRequest?.cracks || null,
    })
  } catch (error) {
    console.error('Error getting cracks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
