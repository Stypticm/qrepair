import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import {
  sendTelegramMessage,
  sendTelegramPhoto,
} from '@/core/lib/sendTelegramMessage'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, feedback, modelname, price } =
      await request.json()

    if (!telegramId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Saving feedback:', {
      telegramId,
      feedback,
      modelname,
      price,
    })

    // Находим активную заявку пользователя
    const existingSkupka = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
    })

    if (existingSkupka) {
      // Обновляем существующую заявку с feedback
      const updatedSkupka = await prisma.skupka.update({
        where: { id: existingSkupka.id },
        data: {
          feedback: feedback.trim(),
          priceAgreed: false, // Пользователь не согласен с ценой
          status: 'submitted', // Меняем статус на submitted для обработки feedback
          submittedAt: new Date(),
        },
      })

      console.log(
        'Updated skupka with feedback:',
        updatedSkupka.id
      )

      // Отправляем уведомление в Telegram
      try {
        const message = `📝 Получен отзыв от пользователя

👤 Пользователь: @${existingSkupka.username || telegramId}
📱 Устройство: ${modelname || 'Не указано'}
💰 Предложенная цена: ${
          price
            ? `${price.toLocaleString()} ₽`
            : 'Не указана'
        }

💬 Отзыв:
"${feedback.trim()}"

Статус: Пользователь не согласен с оценкой`

        // Отправляем фото с подписью
        // Отправляем фото как файл (рабочий способ)
        const filePath = path.join(
          process.cwd(),
          'public',
          'submit.png'
        )
        console.log(
          'Sending feedback photo file from:',
          filePath
        )

        // Проверяем, существует ли файл
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found: ' + filePath)
        }

        // Читаем файл
        const fileBuffer = fs.readFileSync(filePath)
        console.log(
          'Feedback file size:',
          fileBuffer.length,
          'bytes'
        )

        // Создаем FormData для отправки файла
        const formData = new FormData()
        formData.append('chat_id', telegramId)
        formData.append(
          'photo',
          new Blob([fileBuffer], { type: 'image/png' }),
          'submit.png'
        )
        formData.append('caption', message)
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
          'NEXT_PUBLIC_USE_SUPABASE_IMAGES:',
          process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES
        )
        console.log(
          'Feedback notification with photo sent to Telegram'
        )
      } catch (telegramError) {
        console.error(
          'Error sending feedback notification:',
          telegramError
        )
        // Не прерываем выполнение при ошибке отправки в Telegram
      }

      return NextResponse.json({
        success: true,
        skupka: updatedSkupka,
      })
    } else {
      // Создаем новую заявку с feedback
      const newSkupka = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: telegramId, // Fallback username
          modelname: modelname,
          price: price,
          feedback: feedback.trim(),
          priceAgreed: false,
          status: 'submitted',
          submittedAt: new Date(),
          photoUrls: [],
        },
      })

      console.log(
        'Created new skupka with feedback:',
        newSkupka.id
      )

      // Отправляем уведомление в Telegram
      try {
        const message = `📝 Получен отзыв от пользователя

👤 Пользователь: @${telegramId}
📱 Устройство: ${modelname || 'Не указано'}
💰 Предложенная цена: ${
          price
            ? `${price.toLocaleString()} ₽`
            : 'Не указана'
        }

💬 Отзыв:
"${feedback.trim()}"

Статус: Пользователь не согласен с оценкой`

        // Отправляем фото с подписью
        // Отправляем фото как файл (рабочий способ)
        const filePath = path.join(
          process.cwd(),
          'public',
          'submit.png'
        )
        console.log(
          'Sending feedback photo file from:',
          filePath
        )

        // Проверяем, существует ли файл
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found: ' + filePath)
        }

        // Читаем файл
        const fileBuffer = fs.readFileSync(filePath)
        console.log(
          'Feedback file size:',
          fileBuffer.length,
          'bytes'
        )

        // Создаем FormData для отправки файла
        const formData = new FormData()
        formData.append('chat_id', telegramId)
        formData.append(
          'photo',
          new Blob([fileBuffer], { type: 'image/png' }),
          'submit.png'
        )
        formData.append('caption', message)
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
          'NEXT_PUBLIC_USE_SUPABASE_IMAGES:',
          process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES
        )
        console.log(
          'Feedback notification with photo sent to Telegram'
        )
      } catch (telegramError) {
        console.error(
          'Error sending feedback notification:',
          telegramError
        )
        // Не прерываем выполнение при ошибке отправки в Telegram
      }

      return NextResponse.json({
        success: true,
        skupka: newSkupka,
      })
    }
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
