import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

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

    const master = await prisma.master.findUnique({
      where: { telegramId },
      include: { point: true },
    })

    if (!master) {
      return NextResponse.json({ points: [] })
    }

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
