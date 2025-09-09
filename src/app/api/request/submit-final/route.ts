import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  sendTelegramMessage,
  sendTelegramPhoto,
} from '@/core/lib/sendTelegramMessage'
import { getServerImageUrl } from '@/core/lib/assets'
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

    if (!telegramId || !userTelegramId || !modelname) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      )
    }

    // Получаем информацию о точке из базы данных
    let pickupPointAddress = 'Адрес не указан'
    if (deliveryData?.pickupPoint) {
      // Если адрес передан в deliveryData, используем его
      pickupPointAddress = deliveryData.pickupPoint
      console.log(
        '📍 Используем адрес из deliveryData:',
        pickupPointAddress
      )
    } else {
      // Иначе получаем из базы данных
      const draftRecord = await prisma.skupka.findFirst({
        where: {
          telegramId: telegramId,
          status: 'draft',
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      if (draftRecord?.pickupPoint) {
        pickupPointAddress = draftRecord.pickupPoint
        console.log(
          '📍 Используем адрес из БД:',
          pickupPointAddress
        )
      } else {
        console.log('⚠️ Адрес точки не найден в БД')
      }
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
        pickupPoint: pickupPointAddress,
      },
    })

    let skupkaId = null
    if (updatedSkupka.count === 0) {
      // Если запись не найдена, создаем новую
      const newSkupka = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: telegramId,
          modelname: modelname,
          price: price,
          priceAgreed: true,
          telegramIdConfirmed: true,
          userTelegramId: userTelegramId,
          deliveryMethod:
            deliveryData?.deliveryMethod || 'pickup',
          pickupPoint: pickupPointAddress,
          courierAddress:
            deliveryData?.courierAddress || null,
          courierDate: deliveryData?.courierDate
            ? new Date(deliveryData.courierDate)
            : null,
          courierTime: deliveryData?.courierTime || null,
          status: 'submitted',
          submittedAt: new Date(),
          photoUrls: [],
        },
      })
      skupkaId = newSkupka.id
    } else {
      // Получаем ID обновленной записи
      const updatedRecord = await prisma.skupka.findFirst({
        where: {
          telegramId: telegramId,
          status: 'submitted',
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      skupkaId = updatedRecord?.id
    }

    // Формируем сообщение для Telegram
    const requestId = skupkaId || 'UNKNOWN'
    let telegramMessage = `📱 Новая заявка на выкуп устройства\n\n`
    telegramMessage += `🆔 ID заявки: **${requestId}**\n`
    telegramMessage += `👤 Пользователь: ${userTelegramId}\n`
    telegramMessage += `📱 Устройство: ${modelname}\n`
    telegramMessage += `💰 Предварительная цена: ${price?.toLocaleString()} ₽\n\n`

    const deliveryMethod =
      deliveryData?.deliveryMethod || 'pickup'

    if (deliveryMethod === 'pickup') {
      telegramMessage += `🏪 Способ передачи: Личная доставка\n`
      telegramMessage += `📍 Точка: ${pickupPointAddress}\n`
    } else if (deliveryMethod === 'courier') {
      telegramMessage += `🚚 Способ передачи: Мастер\n`
      telegramMessage += `🏠 Адрес: ${
        deliveryData?.courierAddress || 'Не указан'
      }\n`
    }

    if (
      deliveryMethod === 'courier' &&
      deliveryData?.courierDate
    ) {
      telegramMessage += `\n⏰ Время приезда мастера: ${new Date(
        deliveryData.courierDate
      ).toLocaleDateString('ru-RU')} в ${
        deliveryData.courierTime || 'Не указано'
      }`
    }

    telegramMessage += `\n\n📞 Менеджер свяжется с вами для уточнения деталей и подтверждения времени`

    // Маппинг тестовых ID на реальные
    const getRealTelegramId = (id: string) => {
      if (id === '1') return '531360988' // @Stypticm
      if (id === '2') return '296925626' // Другой админ
      if (id === '3') return '1' // Третий админ
      return id
    }

    const realTelegramId = getRealTelegramId(telegramId)

    // Проверяем, является ли telegramId реальным ID пользователя Telegram
    const isRealTelegramId =
      telegramId &&
      !['browser_test_user'].includes(telegramId)

    console.log(
      'Attempting to send Telegram message to:',
      telegramId
    )
    console.log('Real Telegram ID:', realTelegramId)
    console.log('Is real Telegram ID:', isRealTelegramId)
    console.log('Message content:', telegramMessage)
    console.log(
      'BOT_TOKEN exists:',
      !!process.env.BOT_TOKEN
    )
    console.log(
      'BOT_TOKEN value:',
      process.env.BOT_TOKEN ? 'SET' : 'NOT SET'
    )

    if (isRealTelegramId && process.env.BOT_TOKEN) {
      try {
        // Отправляем фото по URL из Supabase Storage (рабочий способ)
        const imageUrl =
          'https://aygvejwrrifuhbkbivoa.supabase.co/storage/v1/object/public/pictures/submit.png'
        console.log('Sending photo by URL:', imageUrl)

        // Создаем FormData для отправки фото по URL
        const formData = new FormData()
        formData.append('chat_id', realTelegramId) // Используем реальный ID
        formData.append('photo', imageUrl)
        formData.append('caption', telegramMessage)
        formData.append('parse_mode', 'Markdown')

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
          'Telegram photo with message sent successfully to:',
          realTelegramId
        )
      } catch (error) {
        console.error(
          'Error sending Telegram photo:',
          error
        )

        // Fallback: если не удалось отправить фото, отправляем обычное сообщение
        try {
          await sendTelegramMessage(
            realTelegramId, // Используем реальный ID
            telegramMessage,
            { parse_mode: 'Markdown' }
          )
          console.log(
            'Fallback: Telegram message sent successfully to:',
            realTelegramId
          )
        } catch (fallbackError) {
          console.error(
            'Error sending fallback Telegram message:',
            fallbackError
          )
          // Не прерываем выполнение, если не удалось отправить в Telegram
        }
      }
    } else {
      console.log(
        '⚠️ Skipping Telegram message - test mode or missing BOT_TOKEN'
      )
      console.log(
        '📝 Message that would be sent to:',
        realTelegramId
      )
      console.log('📝 Message content:', telegramMessage)
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
