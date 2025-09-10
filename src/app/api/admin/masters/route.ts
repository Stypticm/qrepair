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

    // Получаем всех мастеров с их точками
    const masters = await prisma.master.findMany({
      include: { point: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ masters })
  } catch (error) {
    console.error('Error fetching masters:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
