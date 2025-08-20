import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

const TIME_SLOTS = [
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
]

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { courierTelegramId } = body as {
    courierTelegramId?: string
  }
  if (!id || !courierTelegramId) {
    return NextResponse.json(
      { error: 'Missing id or courierTelegramId' },
      { status: 400 }
    )
  }

  const app = await prisma.skupka.findUnique({
    where: { id },
  })
  if (!app)
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )

  await prisma.skupka.update({
    where: { id },
    data: {
      courierTelegramId,
      courierUserConfirmed: false,
    },
  })

  const keyboard = {
    inline_keyboard: [
      TIME_SLOTS.map((t) => ({
        text: t,
        callback_data: `courier_time:${id}:${t}`,
      })),
    ],
  }

  await sendTelegramMessage(
    app.telegramId,
    '🚚 Назначен курьер. Выберите удобное время завтра:',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )

  return NextResponse.json({ success: true })
}
