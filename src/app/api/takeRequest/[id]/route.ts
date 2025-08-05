import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    console.error('Missing id in params:', params)
    return NextResponse.json(
      { error: 'Missing request ID' },
      { status: 400 }
    )
  }

  try {
    // Находим заявку по id
    const request = await prisma.skupka.findUnique({
      where: { id },
    })

    if (!request || request.status !== 'accepted') {
      console.warn(
        `No submitted request found for id: ${id}`
      )
      return NextResponse.json(
        { error: 'No submitted request found' },
        { status: 404 }
      )
    }

    // Обновляем статус
    const updatedRequest = await prisma.skupka.update({
      where: { id },
      data: { status: 'in_progress' },
    })

    console.log('Updated request:', updatedRequest)

    // Отправляем сообщение пользователю
    await sendTelegramMessage(
      updatedRequest.telegramId,
      '📱 Ваша заявка принята в работу. Ожидайте, скоро с вами свяжется мастер.',
      { parse_mode: 'Markdown' }
    )

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    })
  } catch (error) {
    console.error('Error in takeRequest:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
