import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, answers, price } =
      await request.json()

    if (!telegramId || !modelname) {
      return NextResponse.json(
        { error: 'Telegram ID and modelname required' },
        { status: 400 }
      )
    }

    // Ищем существующую заявку по telegramId
    const existingRequest = await prisma.skupka.findFirst({
      where: { telegramId },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Обновляем заявку как завершенную
    const updatedRequest = await prisma.skupka.update({
      where: { id: existingRequest.id },
      data: {
        modelname,
        answers: answers || [],
        price: price || null,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Отправляем уведомление в Telegram
    try {
      // Получаем deviceConditions из БД для расчета процентов
      const deviceConditions =
        existingRequest.deviceConditions as any
      let totalPenalty = 0

      if (deviceConditions) {
                      if (deviceConditions.front) {
                if (deviceConditions.front === 'Новый')
                  totalPenalty += 0
                else if (
                  deviceConditions.front === 'Очень хорошее'
                )
                  totalPenalty += -3
                else if (
                  deviceConditions.front ===
                  'Заметные царапины'
                )
                  totalPenalty += -8
                else if (deviceConditions.front === 'Трещины')
                  totalPenalty += -15
              }

              if (deviceConditions.back) {
                if (deviceConditions.back === 'Новый')
                  totalPenalty += 0
                else if (
                  deviceConditions.back === 'Очень хорошее'
                )
                  totalPenalty += -3
                else if (
                  deviceConditions.back ===
                  'Заметные царапины'
                )
                  totalPenalty += -8
                else if (deviceConditions.back === 'Трещины')
                  totalPenalty += -15
              }

              if (deviceConditions.side) {
                if (deviceConditions.side === 'Новый')
                  totalPenalty += 0
                else if (
                  deviceConditions.side === 'Очень хорошее'
                )
                  totalPenalty += -3
                else if (
                  deviceConditions.side ===
                  'Заметные царапины'
                )
                  totalPenalty += -8
                else if (deviceConditions.side === 'Трещины')
                  totalPenalty += -15
              }
      }

      // Используем переданную цену вместо расчета
      const finalPrice = price || 48000

      const message = `✅ *Заявка принята!*

📱 *Модель:* ${modelname}
📊 *Оценка состояния:* ${totalPenalty}%
💵 *Итоговая цена:* ${finalPrice.toLocaleString()} ₽

Мы свяжемся с вами в ближайшее время для уточнения деталей.`

      await sendTelegramMessage(telegramId, message, {
        parse_mode: 'Markdown',
      })
    } catch (telegramError) {
      console.error(
        'Error sending Telegram message:',
        telegramError
      )
      // Не прерываем выполнение если не удалось отправить сообщение в Telegram
    }

    return NextResponse.json({
      success: true,
      requestId: updatedRequest.id,
      message: 'Заявка успешно отправлена',
    })
  } catch (error) {
    console.error('Error submitting request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
