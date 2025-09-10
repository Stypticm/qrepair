import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { requestId, masterTelegramId } = await req.json()

    if (!requestId || !masterTelegramId) {
      return NextResponse.json(
        {
          error:
            'Request ID and Master Telegram ID are required',
        },
        { status: 400 }
      )
    }

    // Проверяем, существует ли заявка
    const request = await prisma.skupka.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Проверяем, является ли пользователь мастером
    const master = await prisma.master.findUnique({
      where: { telegramId: masterTelegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Обновляем заявку, назначая её мастеру
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        assignedMasterId: master.id,
        status: 'in_progress', // Меняем статус на "в работе"
      },
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error adding request to master:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
