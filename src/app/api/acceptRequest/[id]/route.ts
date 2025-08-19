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
    // empty body allowed
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

    if (!request || request.status !== 'accepted') {
      console.warn(
        `No accepted request found for id: ${id}`
      )
      return NextResponse.json(
        { error: 'No accepted request found' },
        { status: 404 }
      )
    }

    // Обновляем статус и фиксируем окончательную цену (если передана)
    const dataToUpdate: Record<string, unknown> = {
      status: 'in_progress',
    }
    if (
      maybePrice !== undefined &&
      maybePrice !== null &&
      !Number.isNaN(Number(maybePrice))
    ) {
      dataToUpdate.price = Number(maybePrice)
    }

    const updatedRequest = await prisma.skupka.update({
      where: { id },
      data: dataToUpdate,
    })

    console.log('Updated request:', updatedRequest)

    // Отправляем сообщение пользователю с окончательной ценой
    const finalPrice = updatedRequest.price
    const priceText =
      typeof finalPrice === 'number'
        ? `${Math.round(finalPrice)} ₽`
        : '—'
    const message = `📄 После ознакомления с вашими фото мы определили окончательную цену: ${priceText}.
Если вы согласны, подтвердите, пожалуйста.`
    await sendTelegramMessage(
      updatedRequest.telegramId,
      message,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Да',
                callback_data: `price_confirm_yes:${updatedRequest.id}`,
              },
              {
                text: 'Нет',
                callback_data: `price_confirm_no:${updatedRequest.id}`,
              },
            ],
          ],
        },
      }
    )

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    })
  } catch (error) {
    console.error('Error in acceptRequest:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
