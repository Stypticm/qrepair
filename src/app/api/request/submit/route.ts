import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import {
  sendTelegramMessage,
  sendTelegramPhoto,
} from '@/core/lib/sendTelegramMessage'
import { getAdditionalConditionPenalty } from '@/core/lib/additionalCondition'
import { getPictureUrl } from '@/core/lib/assets'

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, price, imei, sn } =
      await request.json()

    // Логируем полученную модель для отладки
    console.log('Received modelname:', modelname)

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
        price: price || null,
        imei: imei || null,
        sn: sn || null,
        status: 'submitted',
        currentStep: null, // Сбрасываем currentStep после отправки
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Отправляем уведомление в Telegram
    try {
      // Получаем deviceConditions и additionalConditions из БД для расчета процентов
      const deviceConditions =
        existingRequest.deviceConditions as any
      const additionalConditions =
        existingRequest.additionalConditions as any
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
            deviceConditions.front === 'Заметные царапины'
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
            deviceConditions.back === 'Заметные царапины'
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
            deviceConditions.side === 'Заметные царапины'
          )
            totalPenalty += -8
          else if (deviceConditions.side === 'Трещины')
            totalPenalty += -15
        }
      }

      // Добавляем штрафы за дополнительные условия
      if (additionalConditions) {
        if (additionalConditions.faceId) {
          if (additionalConditions.faceId === 'Работает')
            totalPenalty += 0
          else if (
            additionalConditions.faceId === 'Не работает'
          )
            totalPenalty += -10
        }

        if (additionalConditions.touchId) {
          if (additionalConditions.touchId === 'Работает')
            totalPenalty += 0
          else if (
            additionalConditions.touchId === 'Не работает'
          )
            totalPenalty += -8
        }

        if (additionalConditions.backCamera) {
          if (additionalConditions.backCamera === 'Новый')
            totalPenalty += 0
          else if (
            additionalConditions.backCamera ===
            'Очень хорошее'
          )
            totalPenalty += -3
          else if (
            additionalConditions.backCamera ===
            'Заметные царапины'
          )
            totalPenalty += -8
          else if (
            additionalConditions.backCamera === 'Трещины'
          )
            totalPenalty += -15
        }

        if (additionalConditions.battery) {
          if (additionalConditions.battery === '95%')
            totalPenalty += 0
          else if (additionalConditions.battery === '90%')
            totalPenalty += -2
          else if (additionalConditions.battery === '85%')
            totalPenalty += -5
          else if (additionalConditions.battery === '75%')
            totalPenalty += -10
        }
      }

      // Используем переданную цену вместо расчета
      const finalPrice = price || 48000

      const caption = `✅ *Заявка принята!*

📱 *Модель:* ${modelname}
💵 *Итоговая цена:* ${finalPrice.toLocaleString()} ₽

Мы свяжемся с вами в ближайшее время для уточнения деталей.`

      // Отправляем фото с подписью из Supabase
      const photoUrl = getPictureUrl('submit.png')
      await sendTelegramPhoto(
        telegramId,
        photoUrl,
        caption,
        {
          parse_mode: 'Markdown',
        }
      )
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
