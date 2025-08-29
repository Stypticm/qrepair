import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )
  }

  try {
    const devices = await prisma.skupka.findMany({
      where: { telegramId },
      select: {
        id: true,
        telegramId: true,
        modelname: true,
        photoUrls: true,
        status: true,
        comment: true,
        imei: true,
        answers: true,
        price: true,
        priceConfirmed: true,
        courierTelegramId: true,
        courierScheduledAt: true,
        courierTimeSlot: true,
        courierUserConfirmed: true,
        courierReminderSent: true,
        finalPrice: true,
        inspectionCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(devices)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
