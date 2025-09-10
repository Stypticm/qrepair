import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { masterId, pointId, adminTelegramId } =
      await req.json()

    if (!masterId || !pointId || !adminTelegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь является админом
    const admin = await prisma.master.findUnique({
      where: { telegramId: adminTelegramId },
    })

    if (!admin || admin.telegramId !== '1') {
      // Только главный админ
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Проверяем, что точка существует
    const point = await prisma.point.findUnique({
      where: { id: parseInt(pointId) },
    })

    if (!point) {
      return NextResponse.json(
        { error: 'Point not found' },
        { status: 404 }
      )
    }

    // Назначаем мастера на точку
    const master = await prisma.master.update({
      where: { id: masterId },
      data: { pointId: parseInt(pointId) },
    })

    // Отправляем уведомление мастеру об изменении точки
    try {
      const { sendTelegramMessage } = await import(
        '@/core/lib/sendTelegramMessage'
      )

      const notificationMessage = `📍 <b>Изменение рабочей точки</b>

Ваша рабочая точка была изменена администратором.

🏢 <b>Новая точка:</b> ${point.address}
🕒 <b>Режим работы:</b> ${point.workingHours}

Проверьте новые заявки в приложении.`

      await sendTelegramMessage(
        master.telegramId,
        notificationMessage,
        {
          parse_mode: 'HTML',
        }
      )
    } catch (notificationError) {
      console.error(
        'Error sending point change notification:',
        notificationError
      )
      // Не прерываем выполнение если не удалось отправить уведомление
    }

    return NextResponse.json({ success: true, master })
  } catch (error) {
    console.error('Error assigning master:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
