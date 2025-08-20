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

  // DEV-only dynamic slots for quick cron testing: now +10m, +11m
  // PROD: use TIME_SLOTS defined above
  const isDev = process.env.NODE_ENV !== 'production'
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`
  let slots: string[] = TIME_SLOTS
  if (isDev) {
    const now = new Date()
    const plus10 = new Date(now.getTime() + 10 * 60 * 1000)
    const plus11 = new Date(now.getTime() + 11 * 60 * 1000)
    slots = [fmt(plus10), fmt(plus11)]
    // For PROD, comment out above and rely on TIME_SLOTS
  }

  const keyboard = {
    inline_keyboard: [
      slots.map((t) => ({
        text: t,
        callback_data: `courier_time:${id}:${t}`,
      })),
    ],
  }

  await sendTelegramMessage(
    app.telegramId,
    isDev
      ? '🚚 Назначен курьер. Выберите удобное время (для теста):'
      : '🚚 Назначен курьер. Выберите удобное время завтра:',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )

  return NextResponse.json({ success: true })
}
