import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { checkRole } from '@/core/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { masterId, pointId, adminTelegramId } = await req.json()

    if (!masterId || !pointId || !adminTelegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER'])
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const point = await prisma.point.findUnique({
      where: { id: Number(pointId) },
    })

    if (!point) {
      return NextResponse.json(
        { error: 'Point not found' },
        { status: 404 }
      )
    }

    const master = await prisma.master.update({
      where: { id: masterId },
      data: { pointId: Number(pointId) },
    })

    try {
      const { sendTelegramMessage } = await import('@/core/lib/sendTelegramMessage')

      const notificationMessage = `📍 <b>Обновлён пункт приёма</b>

Новый пункт приёма был назначен администратором.

🏠 <b>Адрес пункта:</b> ${point.address}
🕒 <b>График работы:</b> ${point.workingHours}

Пожалуйста, уточните детали в переписке.`

      await sendTelegramMessage(master.telegramId, notificationMessage, {
        parse_mode: 'HTML',
      })
    } catch (notificationError) {
      console.error('Error sending point change notification:', notificationError)
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
