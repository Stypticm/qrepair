import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: unknown = null
  try {
    body = await req.json()
  } catch (_) {
    // no body provided
  }
  const maybeObj =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {}
  const maybePrice = maybeObj.price

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

    if (!request || request.status !== 'in_progress') {
      console.warn(
        `No in_progress request found for id: ${id}`
      )
      return NextResponse.json(
        { error: 'No in_progress request found' },
        { status: 404 }
      )
    }

    // Разрешаем переход дальше только при подтверждённой цене
    if (!request.price || !request.priceConfirmed) {
      return NextResponse.json(
        { error: 'Price is not confirmed by user yet' },
        { status: 400 }
      )
    }
    // Обновляем только статус. Цена на этом шаге не меняется
    const dataToUpdate: Record<string, unknown> = {
      status: 'on_the_way',
    }

    const updatedRequest = await prisma.skupka.update({
      where: { id },
      data: dataToUpdate,
    })

    console.log('Updated request:', updatedRequest)

    // Отправляем сообщение пользователю
    const finalPrice = updatedRequest.price
    const priceText =
      typeof finalPrice === 'number'
        ? `${Math.round(finalPrice)} ₽`
        : '—'
    const message = `👨‍🔧 Мастер назначен для забора устройства.\n💰 Окончательная цена: ${priceText}.`
    await sendTelegramMessage(
      updatedRequest.telegramId,
      message,
      { parse_mode: 'Markdown' }
    )

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    })
  } catch (error) {
    console.error('Error in reviewRequest:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
