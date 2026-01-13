import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'TelegramId is required' },
        { status: 400 }
      )
    }

    // Ищем активную заявку пользователя
    const activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
      },
      select: {
        deviceConditions: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (activeRequest) {
      return NextResponse.json({
        deviceConditions:
          (activeRequest as any).deviceConditions || null,
        status: activeRequest.status,
      })
    } else {
      return NextResponse.json({
        deviceConditions: null,
        status: null,
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
