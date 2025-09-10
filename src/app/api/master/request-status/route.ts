import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    const { requestId, status, telegramId } =
      await req.json()

    if (!requestId || !status || !telegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, что мастер существует
    const master = await prisma.master.findUnique({
      where: { telegramId },
    })

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      )
    }

    // Обновляем статус заявки
    const request = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        status,
        assignedMasterId: master.id,
      },
    })

    // Уведомляем клиента об изменении статуса
    const statusMessages = {
      accepted: '✅ Ваша заявка принята мастером',
      paid: '💰 Мастер произвел оплату',
      completed: '🎉 Заявка завершена',
    }

    if (
      statusMessages[status as keyof typeof statusMessages]
    ) {
      // Здесь можно добавить отправку уведомления клиенту
      console.log(
        `Sending notification to client ${
          request.telegramId
        }: ${
          statusMessages[
            status as keyof typeof statusMessages
          ]
        }`
      )
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
