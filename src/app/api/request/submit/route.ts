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
  // Примеры:
  // "iPhone 16 Pro 256GB Синий 2 SIM Китай" (Pro модель)
  // "iPhone 16 Pro Max 256GB Синий 2 SIM Китай" (Pro Max модель)
  // "iPhone 16 256GB Синий 2 SIM Китай" (базовая модель)
  const parts = modelname.split(' ')

  if (parts.length < 2) return null

  const model = parts[2] // "16" - модель находится на индексе 2
  let variant = '' // По умолчанию пустая строка для базовых моделей
  let storageIndex = 3 // Индекс storage в массиве parts (по умолчанию для базовой модели)

  // Проверяем, есть ли вариант (R, S, S Max, Pro, Pro Max, mini, Plus, SE)
  // В названии "Apple iPhone 16 Pro 256GB..." индекс 3 это "Pro"
  if (parts[3] === 'R') {
    variant = 'R'
    storageIndex = 4 // storage находится на индексе 4
  } else if (parts[3] === 'S') {
    if (parts[4] === 'Max') {
      variant = 'S Max'
      storageIndex = 5 // storage находится на индексе 5
    } else {
      variant = 'S'
      storageIndex = 4 // storage находится на индексе 4
    }
  } else if (parts[3] === 'Pro') {
    if (parts[4] === 'Max') {
      variant = 'Pro Max'
      storageIndex = 5 // storage находится на индексе 5
    } else {
      variant = 'Pro'
      storageIndex = 4 // storage находится на индексе 4
    }
  } else if (parts[3] === 'mini') {
    variant = 'mini'
    storageIndex = 4 // storage находится на индексе 4
  } else if (parts[3] === 'Plus') {
    variant = 'Plus'
    storageIndex = 4 // storage находится на индексе 4
  } else if (parts[3] === 'SE') {
    variant = 'se'
    storageIndex = 4 // storage находится на индексе 4
  }

  const storage = parts[storageIndex] // "256GB"
  const color = parts[storageIndex + 1] // "Синий"
  const simType =
    parts[storageIndex + 2] + ' ' + parts[storageIndex + 3] // "2 SIM"
  const country = parts[storageIndex + 4] // "Китай"

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

  // Ищем модель в массиве с учетом варианта
  let foundPhone = iphones.find(
    (phone: IPhone) =>
      phone.model === model &&
      phone.variant === variant &&
      phone.storage === storage &&
      phone.color === mappedColor &&
      phone.simType === simType &&
      phone.country === mappedCountry
  )

  // Если модель с вариантом не найдена, пробуем найти базовую модель (с пустым вариантом)
  if (!foundPhone && variant !== '') {
    foundPhone = iphones.find(
      (phone: IPhone) =>
        phone.model === model &&
        phone.variant === '' && // Ищем базовую модель
        phone.storage === storage &&
        phone.color === mappedColor &&
        phone.simType === simType &&
        phone.country === mappedCountry
    )

    // Базовая модель найдена или нет
  }

  return foundPhone || null
}

export async function POST(request: Request) {
  try {
    const { telegramId, modelname, price, imei, sn } =
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
      console.log(
        '🚀 DEBUG - Начинаем отправку Telegram сообщения'
      )
      console.log('🚀 DEBUG - telegramId:', telegramId)
      console.log(
        '🚀 DEBUG - BOT_TOKEN exists:',
        !!process.env.BOT_TOKEN
      )

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

      const requestId = updatedRequest.id
      const caption = `✅ <b>Заявка принята!</b>

🆔 <b>ID заявки:</b> <b>${requestId}</b>
📱 <b>Модель:</b> ${modelname}
💵 <b>Итоговая цена:</b> ${finalPrice.toLocaleString()} ₽

Мы свяжемся с вами в ближайшее время для уточнения деталей.`

      // Маппинг тестовых ID на реальные
      const getRealTelegramId = (id: string) => {
        if (id === '1') return '531360988' // @Stypticm
        if (id === '2') return '296925626' // Другой админ
        if (id === '3') return '1' // Третий админ
        return id // Реальные ID остаются без изменений
      }

      const realTelegramId = getRealTelegramId(telegramId)
      console.log(
        '🚀 DEBUG - realTelegramId:',
        realTelegramId
      )
      console.log(
        '🚀 DEBUG - isTestId:',
        ['1', '2', '3'].includes(telegramId)
      )

      // Отправляем фото с подписью из Supabase
      const photoUrl = getPictureUrl('submit.png')
      console.log('🚀 DEBUG - photoUrl:', photoUrl)
      console.log(
        '🚀 DEBUG - caption length:',
        caption?.length
      )

      const telegramResult = await sendTelegramPhoto(
        realTelegramId, // Используем реальный ID
        photoUrl,
        caption,
        {
          parse_mode: 'HTML',
        }
      )

      console.log(
        '🚀 DEBUG - Telegram result:',
        telegramResult
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
