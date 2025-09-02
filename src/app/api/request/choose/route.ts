import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { telegramId, username, price, imei, sn } = body

    // ВРЕМЕННОЕ ЛОГИРОВАНИЕ ДЛЯ ДИАГНОСТИКИ
    console.log('🔍 CHOOSE API - получены данные:', {
      telegramId,
      username,
      price,
      imei,
      sn,
    })

    if (!username) username = 'local_dev'
    if (!telegramId || !username) {
      console.log('❌ CHOOSE API - ошибка валидации')
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    console.log(
      '🔍 CHOOSE API - ищу существующую заявку для telegramId:',
      telegramId
    )
    const existing = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    console.log(
      '🔍 CHOOSE API - найдена заявка:',
      existing?.id || 'НЕ НАЙДЕНА'
    )

    if (existing) {
      console.log(
        '🔄 CHOOSE API - обновляю заявку:',
        existing.id
      )
      const updated = await prisma.skupka.update({
        where: { id: existing.id },
        data: {
          price: price || existing.price,
          imei: imei || existing.imei,
          sn: sn || existing.sn,
        },
      })
      console.log(
        '✅ CHOOSE API - заявка обновлена:',
        updated.id
      )
      return NextResponse.json({ id: updated.id })
    }

    console.log('🆕 CHOOSE API - создаю новую заявку')
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

    console.log(
      '✅ CHOOSE API - новая заявка создана:',
      created.id
    )
    return NextResponse.json({ id: created.id })
  } catch (error) {
    console.error('❌ CHOOSE API - ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
