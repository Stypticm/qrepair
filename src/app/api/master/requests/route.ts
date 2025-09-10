import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const masterTelegramId = searchParams.get(
      'masterTelegramId'
    )

    if (!masterTelegramId) {
      return NextResponse.json(
        { error: 'Master Telegram ID is required' },
        { status: 400 }
      )
    }

    // Находим мастера
    const master = await prisma.master.findUnique({
      where: { telegramId: masterTelegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Получаем только заявки, назначенные этому мастеру
    const requests = await prisma.skupka.findMany({
      where: {
        assignedMasterId: master.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      requests: requests,
    })
  } catch (error) {
    console.error('Error fetching master requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
