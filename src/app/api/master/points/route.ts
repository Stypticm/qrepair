import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Получаем мастера с его точкой
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

    // Возвращаем точки мастера (мастер может быть привязан только к одной точке)
    const points = master.point ? [master.point] : []

    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching master points:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
