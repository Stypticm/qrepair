import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const { deviceConditions, price } = await request.json()
    console.log('API: Получены данные для сохранения:', {
      deviceConditions,
      price,
    })

    // Получаем telegramId из заголовков
    const telegramId =
      request.headers.get('x-telegram-id') || 'test-user'
    console.log('API: telegramId:', telegramId)

    // Находим активную заявку пользователя
    let activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    console.log(
      'API: Найдена заявка:',
      activeRequest?.id || 'не найдена'
    )

    // Если заявки нет, создаем новую
    if (!activeRequest) {
      console.log(
        'API: Создаю новую заявку для telegramId:',
        telegramId
      )
      activeRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: 'Unknown',
          status: 'draft',
        },
      })
      console.log(
        'API: Создана новая заявка:',
        activeRequest.id
      )
    }

    // Обновляем заявку с новыми состояниями
    console.log(
      'API: Обновляю заявку',
      activeRequest.id,
      'с состояниями:',
      JSON.stringify(deviceConditions, null, 2)
    )

    // Получаем текущие состояния из БД
    const currentRequest = await prisma.skupka.findUnique({
      where: { id: activeRequest.id },
      select: { deviceConditions: true },
    })
    console.log(
      'API: Текущие состояния в БД:',
      JSON.stringify(
        currentRequest?.deviceConditions,
        null,
        2
      )
    )

    // Объединяем текущие состояния с новыми
    const currentConditions =
      (currentRequest?.deviceConditions as Record<
        string,
        any
      >) || {}
    const mergedConditions = {
      ...currentConditions,
      ...deviceConditions,
    }
    console.log(
      'API: Объединенные состояния:',
      JSON.stringify(mergedConditions, null, 2)
    )

    const updatedRequest = await prisma.skupka.update({
      where: {
        id: activeRequest.id,
      },
      data: {
        deviceConditions: mergedConditions,
        price: price || undefined, // Сохраняем цену если она передана
      },
    })
    console.log('API: Заявка обновлена:', updatedRequest.id)
    console.log(
      'API: Сохраненные состояния:',
      JSON.stringify(
        updatedRequest.deviceConditions,
        null,
        2
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Состояния устройства сохранены',
      requestId: updatedRequest.id,
    })
  } catch (error) {
    console.error(
      'API: Ошибка сохранения состояний:',
      error
    )
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
