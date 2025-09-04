import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let {
      telegramId,
      username,
      price,
      imei,
      sn,
      currentStep,
    } = body

    console.log('🔍 API /choose - получены данные:', {
      telegramId,
      username,
      price,
      imei,
      sn,
      currentStep,
    })

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
      const updateData = {
        price: price !== undefined ? price : existing.price,
        imei: imei || existing.imei,
        sn: sn || existing.sn,
        currentStep: currentStep || existing.currentStep,
      }

      console.log(
        '🔄 API /choose - обновляем существующую запись:',
        {
          id: existing.id,
          updateData,
        }
      )

      const updated = await prisma.skupka.update({
        where: { id: existing.id },
        data: updateData,
      })
      return NextResponse.json({ id: updated.id })
    }

    const createData = {
      telegramId,
      username,
      status: 'draft' as const,
      price: price !== undefined ? price : null,
      imei: imei || null,
      sn: sn || null,
      currentStep: currentStep || null,
    }

    console.log(
      '🆕 API /choose - создаем новую запись:',
      createData
    )

    const created = await prisma.skupka.create({
      data: createData,
    })

    return NextResponse.json({ id: created.id })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
