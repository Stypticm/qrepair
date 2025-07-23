import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const update = await req.json()
    const message = update.message
    const telegramId = message?.chat?.id?.toString()
    const text = message?.text

    if (!telegramId || !text) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    if (text === '/status') {
      const repairRequest =
        await prisma.repairRequest.findFirst({
          where: {
            telegramId,
            status: {
              in: [
                'draft',
                'submitted',
                'in_progress',
                'completed',
              ],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      const responseText = repairRequest
        ? `Статус вашей заявки: ${
            repairRequest.status === 'submitted'
              ? 'Ожидает обработки'
              : repairRequest.status === 'in_progress'
              ? 'В работе'
              : 'Завершена'
          }`
        : 'У вас нет активных заявок.'

      await sendTelegramMessage(telegramId, responseText)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
