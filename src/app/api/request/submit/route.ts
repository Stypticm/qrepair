import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { telegramId, modelname, price, comment } =
      body || {}

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Invalid request: missing telegramId' },
        { status: 400 }
      )
    }

    const draft = await prisma.skupka.findFirst({
      where: { telegramId, status: 'draft' },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'No draft request found' },
        { status: 400 }
      )
    }

    const dataToUpdate: Record<string, unknown> = {}
    if (typeof modelname === 'string' && modelname.trim()) {
      dataToUpdate.modelname = modelname.trim()
    }
    if (price !== undefined) {
      dataToUpdate.price = price
    }
    if (typeof comment === 'string' && comment.trim()) {
      dataToUpdate.comment = comment.trim()
    }
    dataToUpdate.status = 'accepted'

    const updated = await prisma.skupka.update({
      where: { id: draft.id },
      data: dataToUpdate,
    })

    // Отправляем пользователю базовое уведомление о принятии заявки
    await sendTelegramMessage(
      telegramId,
      '📱 Ваша заявка принята в работу. Ожидайте, с вами свяжется наш менеджер в ближайшее время.',
      { parse_mode: 'Markdown' }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
