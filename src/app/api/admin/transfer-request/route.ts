import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const {
      requestId,
      newPointId,
      newMasterId,
      adminTelegramId,
    } = await req.json()

    if (!requestId || !adminTelegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Проверяем, что заявка существует
    const request = await prisma.skupka.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Обновляем заявку
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        pickupPoint: newPointId?.toString(),
        assignedMasterId: newMasterId,
      },
    })

    // Уведомляем нового мастера, если он назначен
    if (newMasterId) {
      const master = await prisma.master.findUnique({
        where: { id: newMasterId },
      })

      if (master) {
        // Здесь можно добавить отправку уведомления мастеру
        console.log(
          `Sending notification to master ${master.telegramId} about transferred request`
        )
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error transferring request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
