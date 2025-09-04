import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  sendTelegramMessage,
  sendTelegramPhoto,
} from '@/core/lib/sendTelegramMessage'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('=== SUBMIT-FINAL REQUEST ===')
    console.log(
      'Request body:',
      JSON.stringify(requestBody, null, 2)
    )
    console.log('============================')

    const {
      telegramId,
      userTelegramId,
      modelname,
      price,
      deliveryData,
    } = requestBody

    if (
      !telegramId ||
      !userTelegramId ||
      !modelname ||
      !deliveryData
    ) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      )
    }

    // Обновляем запись в базе данных
    const updatedSkupka = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: {
        telegramIdConfirmed: true,
        userTelegramId: userTelegramId,
        priceAgreed: true, // Пользователь согласен с ценой
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    if (updatedSkupka.count === 0) {
      // Если запись не найдена, создаем новую
      await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: telegramId,
          modelname: modelname,
          price: price,
          priceAgreed: true,
          telegramIdConfirmed: true,
          userTelegramId: userTelegramId,
          deliveryMethod: deliveryData.deliveryMethod,
          pickupPoint: deliveryData.pickupPoint,
          courierAddress: deliveryData.courierAddress,
          courierDate: deliveryData.courierDate
            ? new Date(deliveryData.courierDate)
            : null,
          courierTime: deliveryData.courierTime,
          status: 'submitted',
          submittedAt: new Date(),
          photoUrls: [],
        },
      })
    }

    // Формируем сообщение для Telegram
    let telegramMessage = `📱 Новая заявка на выкуп устройства\n\n`
    telegramMessage += `👤 Пользователь: ${userTelegramId}\n`
    telegramMessage += `📱 Устройство: ${modelname}\n`
    telegramMessage += `💰 Предварительная цена: ${price?.toLocaleString()} ₽\n\n`

    if (deliveryData.deliveryMethod === 'pickup') {
      telegramMessage += `🏪 Способ передачи: Личная доставка\n`
      telegramMessage += `📍 Точка: ${deliveryData.pickupPoint}\n`
    } else if (deliveryData.deliveryMethod === 'courier') {
      telegramMessage += `🚚 Способ передачи: Мастер\n`
      telegramMessage += `🏠 Адрес: ${deliveryData.courierAddress}\n`
    }

    if (deliveryData.deliveryMethod === 'courier') {
      telegramMessage += `\n⏰ Время приезда мастера: ${new Date(
        deliveryData.courierDate
      ).toLocaleDateString('ru-RU')} в ${
        deliveryData.courierTime
      }`
    }

    telegramMessage += `\n\n📞 Менеджер свяжется с вами для уточнения деталей и подтверждения времени`

    // Отправляем сообщение в Telegram бот
    console.log(
      'Attempting to send Telegram message to:',
      telegramId
    )
    console.log('Message content:', telegramMessage)
    console.log(
      'BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )

    try {
      // Отправляем фото как файл (рабочий способ)
      const filePath = path.join(
        process.cwd(),
        'public',
        'submit.jpg'
      )
      console.log('Sending photo file from:', filePath)

      // Проверяем, существует ли файл
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath)
      }

      // Читаем файл
      const fileBuffer = fs.readFileSync(filePath)
      console.log('File size:', fileBuffer.length, 'bytes')

      // Создаем FormData для отправки файла
      const formData = new FormData()
      formData.append('chat_id', telegramId)
      formData.append(
        'photo',
        new Blob([fileBuffer], { type: 'image/jpeg' }),
        'submit.jpg'
      )
      formData.append('caption', telegramMessage)
      // formData.append('parse_mode', 'Markdown') // Убираем Markdown из-за ошибки парсинга

      // Отправляем в Telegram
      const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!data.ok) {
        throw new Error(
          data.description || 'Telegram API error'
        )
      }

      console.log(
        'Telegram photo with message sent successfully'
      )
    } catch (error) {
      console.error('Error sending Telegram photo:', error)

      // Fallback: если не удалось отправить фото, отправляем обычное сообщение
      try {
        await sendTelegramMessage(
          telegramId,
          telegramMessage
        )
        console.log(
          'Fallback: Telegram message sent successfully'
        )
      } catch (fallbackError) {
        console.error(
          'Error sending fallback Telegram message:',
          fallbackError
        )
        // Не прерываем выполнение, если не удалось отправить в Telegram
      }
    }

    console.log('Telegram message:', telegramMessage)

    return NextResponse.json({
      success: true,
      message: telegramMessage,
    })
  } catch (error) {
    console.error(
      'Ошибка при финальной отправке заявки:',
      error
    )
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
