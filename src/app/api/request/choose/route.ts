import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  let { telegramId, username, price, imei, sn } = body

  if (!username) username = 'local_dev'
  if (!telegramId || !username) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const existing = await prisma.skupka.findFirst({
    where: { telegramId, status: 'draft' },
  })

  if (existing) {
    // Обновляем существующую заявку с новыми данными
    const updated = await prisma.skupka.update({
      where: { id: existing.id },
      data: {
        price: price || existing.price,
        imei: imei || existing.imei,
        sn: sn || existing.sn,
      },
    })
    return NextResponse.json({ id: updated.id })
  }

  const created = await prisma.skupka.create({
    data: {
      telegramId,
      username,
      status: 'draft',
      price: price || null,
      imei: imei || null,
      sn: sn || null,
    },
  })

  return NextResponse.json({ id: created.id })
}
