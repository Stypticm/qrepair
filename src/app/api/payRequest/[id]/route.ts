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

    if (!request || request.status !== 'on_the_way') {
      console.warn(
        `No on_the_way request found for id: ${id}`
      )
      return NextResponse.json(
        { error: 'No on_the_way request found' },
        { status: 404 }
      )
    }

    // Обновляем статус
    const updatedRequest = await prisma.skupka.update({
      where: { id },
      data: { status: 'paid' },
    })

    console.log('Updated request:', updatedRequest)

    // Отправляем сообщение пользователю
    await sendTelegramMessage(
      updatedRequest.telegramId,
      '💰 Оплата за ваш телефон успешно получена. Спасибо!',
      { parse_mode: 'Markdown' }
    )

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    })
  } catch (error) {
    console.error('Error in payRequest:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
