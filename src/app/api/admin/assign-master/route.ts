import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { masterId, pointId } = await req.json()

    if (!masterId || !pointId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const point = await prisma.point.findUnique({ where: { id: Number(pointId) } })

    if (!point) {
      return NextResponse.json({ error: 'Point not found' }, { status: 404 })
    }

    const master = await prisma.master.update({
      where: { id: masterId },
      data: { pointId: Number(pointId) },
    })

    try {
      const { sendTelegramMessage } = await import('@/core/lib/sendTelegramMessage')
      const notificationMessage = `📍 <b>Обновлён пункт приёма</b>\n\nНовый пункт приёма был назначен администратором.\n\n🏠 <b>Адрес пункта:</b> ${point.address}\n🕒 <b>График работы:</b> ${point.workingHours}\n\nПожалуйста, уточните детали в переписке.`
      await sendTelegramMessage(master.telegramId, notificationMessage, { parse_mode: 'HTML' })
    } catch (notificationError) {
      console.error('Error sending point change notification:', notificationError)
    }

    return NextResponse.json({ success: true, master })
  } catch (error) {
    console.error('Error assigning master:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
