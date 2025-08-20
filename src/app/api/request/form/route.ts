import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Repair request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { telegramId, price, comment, imei } = body

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const dataToUpdate: Record<string, unknown> = {}

  if (price !== undefined) dataToUpdate.price = price
  if (comment?.trim()) dataToUpdate.comment = comment.trim()
  if (typeof imei === 'string' && imei.trim())
    dataToUpdate.imei = imei.trim()

  // Если есть обновляемые поля, можно менять статус
  if (Object.keys(dataToUpdate).length > 0) {
    dataToUpdate.status = 'accepted'
  } else {
    return NextResponse.json(
      { error: 'No data provided to update' },
      { status: 400 }
    )
  }

  try {
    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft request found' },
        { status: 400 }
      )
    }

    const updated = await prisma.skupka.update({
      where: { id: draft.id },
      data: dataToUpdate,
    })

    // Отправляем уведомление пользователю о принятии заявки в работу с предварительной ценой
    const prelimPrice =
      typeof updated.price === 'number'
        ? `${Math.round(updated.price)} ₽`
        : '—'
    const acceptMessage = `📱 Ваша заявка принята в работу. Ожидайте, с вами свяжется наш менеджер в ближайшее время.\n💰 Предварительная цена: ${prelimPrice}.`
    await sendTelegramMessage(telegramId, acceptMessage, {
      parse_mode: 'Markdown',
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error updating brand info' },
      { status: 500 }
    )
  }
}
