import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const applications = await prisma.skupka.findMany()
    return NextResponse.json(applications)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { telegramId } = body

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Missing telegramId' },
        { status: 400 }
      )
    }

    const updated = await prisma.skupka.updateMany({
      where: {
        telegramId,
        status: 'accepted',
      },
      data: {
        status: 'in_progress',
      },
    })

    if (updated.count > 0) {
      await sendTelegramMessage(
        telegramId,
        '📱 Ваша заявка передана в работу. Ожидайте, скоро с вами свяжется мастер.'
      )
    }

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
