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
        status: true,
        comment: true,
        imei: true,
        sn: true,
        courier: true,
        price: true,
        damagePercent: true,
        priceConfirmed: true,
        inspection: true,
        inspectionCompleted: true,
        deviceData: true,
        currentStep: true,
        courierUserConfirmed: true,
        courierReminderSent: true,
        finalPrice: true,
        deviceConditions: true,
        additionalConditions: true,
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
