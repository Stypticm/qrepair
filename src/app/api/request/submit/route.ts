import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'
import {
  sendTelegramMessage,
  sendTelegramPhoto,
} from '@/core/lib/sendTelegramMessage'
import { getAdditionalConditionPenalty } from '@/core/lib/additionalCondition'
import { getPictureUrl } from '@/core/lib/assets'
import { iphones, IPhone } from '@/core/appleModels'

// Функция для поиска модели по названию
function findModelByName(modelname: string): IPhone | null {
  // Парсим название модели для извлечения параметров
  // Пример: "iPhone 13 128GB Синий 1 SIM Китай"
  const parts = modelname.split(' ')

  if (parts.length < 2) return null

  const model = parts[1] // "13"
  const storage = parts[2] // "128GB"
  const color = parts[3] // "Синий"
  const simType = parts[4] + ' ' + parts[5] // "1 SIM"
  const country = parts[6] // "Китай"

  // Маппинг цветов
  const colorMap: { [key: string]: string } = {
    Золотой: 'G',
    Красный: 'R',
    Синий: 'Bl',
    Белый: 'Wh',
    Черный: 'C',
  }

  // Маппинг стран
  const countryMap: { [key: string]: string } = {
    Китай: 'Китай 🇨🇳',
    США: 'США 🇺🇸',
    Япония: 'Япония 🇯🇵',
  }

  const mappedColor = colorMap[color] || color
  const mappedCountry = countryMap[country] || country

  // Ищем модель в массиве
  const foundPhone = iphones.find(
    (phone: IPhone) =>
      phone.model === model &&
      phone.storage === storage &&
      phone.color === mappedColor &&
      phone.simType === simType &&
      phone.country === mappedCountry
  )

  return foundPhone || null
}

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

      // Используем переданную цену или ищем basePrice из модели
      let finalPrice = price || 0

      // Если цена не передана, пытаемся найти basePrice из модели
      if (!price && modelname) {
        const foundModel = findModelByName(modelname)
        if (foundModel) {
          finalPrice = foundModel.basePrice
        }
      }

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
