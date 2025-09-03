import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegramId, username, serialNumber } = body

    if (!telegramId || !serialNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку
    let existingRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingRequest) {
      // Обновляем существующую заявку
      const updatedRequest = await prisma.skupka.update({
        where: { id: existingRequest.id },
        data: {
          username: username || existingRequest.username,
          sn: serialNumber,
          currentStep: 'device-info',
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        request: updatedRequest,
      })
    } else {
      // Создаем новую заявку
      const newRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: username || 'Unknown',
          sn: serialNumber,
          status: 'draft',
          currentStep: 'device-info',
        },
      })

      return NextResponse.json({
        success: true,
        request: newRequest,
      })
    }
  } catch (error) {
    console.error('Error saving device info:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
