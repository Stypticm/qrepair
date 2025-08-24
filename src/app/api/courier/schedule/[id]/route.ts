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
  const { masterUsername } = body as {
    masterUsername?: string
  }
  if (!id || !masterUsername) {
    return NextResponse.json(
      { error: 'Missing id or masterUsername' },
      { status: 400 }
    )
  }

  // Находим мастера по username
  const master = await prisma.master.findUnique({
    where: { username: masterUsername },
  })
  if (!master) {
    return NextResponse.json(
      { error: 'Master not found' },
      { status: 404 }
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
      courierTelegramId: master.telegramId,
      courierUserConfirmed: false,
      // Устанавливаем флаг только если не отправлялось
      ...(isSent ? {} : { courierTimeSlotSent: false }),
    },
  })

  // Генерация слотов в зависимости от времени
  const now = new Date()
  const currentHour = now.getHours()
  let slots: string[] = []
  // PROD логика (по умолчанию): показываем оставшиеся часы текущего дня
  // - до 10:00 → все слоты 10:00–20:00
  // - 10:00–19:59 → слоты (currentHour+1)–20:00
  // - после 20:00 → слоты на завтра 10:00–20:00
  if (currentHour < 10) {
    slots = TIME_SLOTS.filter((slot) => {
      const [slotHour] = slot.split(':').map(Number)
      return slotHour >= 10 && slotHour <= 20
    })
  } else if (currentHour >= 10 && currentHour < 20) {
    slots = TIME_SLOTS.filter((slot) => {
      const [slotHour] = slot.split(':').map(Number)
      return slotHour >= currentHour + 1 && slotHour <= 20
    })
  } else {
    // завтра
    slots = TIME_SLOTS.filter((slot) => {
      const [slotHour] = slot.split(':').map(Number)
      return slotHour >= 10 && slotHour <= 20
    })
  }

  // DEV: тестовый слот ровно через 5 минут от текущего времени
  if (process.env.NODE_ENV !== 'production') {
    const plus5 = new Date(now.getTime() + 5 * 60 * 1000)
    const hh = String(plus5.getHours()).padStart(2, '0')
    const mm = String(plus5.getMinutes()).padStart(2, '0')
    slots = [`${hh}:${mm}`]
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
