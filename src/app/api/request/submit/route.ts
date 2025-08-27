import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, answers } =
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
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Отправляем уведомление в Telegram
    try {
      const totalPenalty = answers
        ? answers.reduce(
            (total: number, answer: number) =>
              total + (answer || 0),
            0
          )
        : 0
      const deviceCatalog = {
        'Apple iPhone 11': 48000,
        'Apple iPhone 12': 56000,
        'Apple iPhone 13': 64000,
        'Apple iPhone 14': 72000,
        'Apple iPhone 15': 80000,
      }
      const basePrice =
        deviceCatalog[
          modelname as keyof typeof deviceCatalog
        ] || 48000
      const finalPrice = Math.max(
        basePrice - (basePrice * totalPenalty) / 100,
        0
      )

      const message = `✅ *Заявка принята!*

📱 *Модель:* ${modelname}
💰 *Базовая цена:* ${basePrice.toLocaleString()} ₽
📊 *Оценка состояния:* -${totalPenalty}%
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
