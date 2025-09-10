import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminTelegramId = searchParams.get(
      'adminTelegramId'
    )

    if (!adminTelegramId) {
      return NextResponse.json(
        { error: 'Admin Telegram ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является админом
    const admin = await prisma.master.findUnique({
      where: { telegramId: adminTelegramId },
    })

    if (
      !admin ||
      (admin.telegramId !== '1' &&
        admin.telegramId !== '531360988')
    ) {
      // Только главные админы
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Получаем все заявки с назначенными мастерами
    const requests = await prisma.skupka.findMany({
      include: {
        assignedMaster: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
