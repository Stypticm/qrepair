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
        username: true,
        modelname: true,
        photoUrls: true,
        videoUrl: true,
        status: true,
        comment: true,
        imei: true,
        contractUrl: true,
        price: true,
        damagePercent: true,
        questionsAnswered: true,
        priceConfirmed: true,
        inspection: true,
        inspectionCompleted: true,
        inspectionToken: true,
        imeiInfo: true,
        phoneData: true,
        currentStep: true,
        courierTelegramId: true,
        courierScheduledAt: true,
        courierTimeSlot: true,
        courierUserConfirmed: true,
        courierReminderSent: true,
        courierTimeSlotSent: true,
        finalPrice: true,
        condition: true,
        cracks: true,
        deviceConditions: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
