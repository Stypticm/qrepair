import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get('telegramId')
    const pointId = searchParams.get('pointId')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    if (!pointId) {
      return NextResponse.json(
        { error: 'Point ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, что мастер привязан к этой точке
    const master = await prisma.master.findUnique({
      where: { telegramId },
      include: { point: true },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    if (master.pointId !== parseInt(pointId)) {
      return NextResponse.json(
        { error: 'Master is not assigned to this point' },
        { status: 403 }
      )
    }

    // Получаем заявки для точки мастера
    const requests = await prisma.skupka.findMany({
      where: {
        pickupPoint: pointId,
        status: 'submitted',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching master requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
