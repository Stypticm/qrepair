import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
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

  // Проверяем, отправлялось ли сообщение ранее
  const isSent = app.courierTimeSlotSent
  await prisma.skupka.update({
    where: { id },
    data: {
      courierTelegramId,
      courierUserConfirmed: false,
      // Устанавливаем флаг только если не отправлялось
      ...(isSent ? {} : { courierTimeSlotSent: false }),
    },
  })

  // Генерация слотов в зависимости от времени
  const now = new Date()
  const currentHour = now.getHours()
  let slots: string[] = []
  if (currentHour >= 10 && currentHour < 20) {
    slots = TIME_SLOTS.filter((slot) => {
      const [slotHour] = slot.split(':').map(Number)
      return slotHour >= currentHour + 1 && slotHour <= 20
    })
  } else {
    slots = TIME_SLOTS.filter((slot) => {
      const [slotHour] = slot.split(':').map(Number)
      return slotHour >= 10 && slotHour <= 12 // Завтра с 10:00
    })
  }

  // DEV: Динамические слоты для теста
  if (process.env.NODE_ENV !== 'production') {
    const plus1 = new Date(now.getTime() + 1 * 60 * 1000)
    const plus2 = new Date(now.getTime() + 2 * 60 * 1000)
    slots = [
      `${String(plus1.getHours()).padStart(
        2,
        '0'
      )}:${String(plus1.getMinutes()).padStart(2, '0')}`,
      `${String(plus2.getHours()).padStart(
        2,
        '0'
      )}:${String(plus2.getMinutes()).padStart(2, '0')}`,
    ]
    // PROD: Раскомментируй для продакшена
    // slots = TIME_SLOTS;
  }

  const keyboard = {
    inline_keyboard: slots.map((t) => [
      { text: t, callback_data: `courier_time:${id}:${t}` },
    ]),
  }

  // Отправляем только если не отправлялось ранее и сразу ставим флаг, чтобы исключить дубли
  if (!isSent) {
    const sent = await sendTelegramMessage(
      app.telegramId,
      process.env.NODE_ENV !== 'production'
        ? '🚚 Назначен мастер. Выберите удобное время (для теста):'
        : '🚚 Назначен мастер. Выберите удобное время:',
      { parse_mode: 'Markdown', reply_markup: keyboard }
    )
    // На всякий случай, если захотим потом убирать клавиатуру по message_id
    // const messageId = sent?.result?.message_id
    await prisma.skupka.update({
      where: { id },
      data: { courierTimeSlotSent: true },
    })
  }

  return NextResponse.json({ success: true })
}
