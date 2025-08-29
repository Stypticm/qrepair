import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const { deviceConditions } = await request.json()
    console.log('API: Получены данные для сохранения:', { deviceConditions })

    // Получаем telegramId из заголовков
    const telegramId =
      request.headers.get('x-telegram-id') || 'test-user'
    console.log('API: telegramId:', telegramId)

    // Находим активную заявку пользователя
    let activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('API: Найдена заявка:', activeRequest?.id || 'не найдена')

    // Если заявки нет, создаем новую
    if (!activeRequest) {
      console.log('API: Создаю новую заявку для telegramId:', telegramId)
      activeRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: 'Unknown',
          status: 'draft'
        }
      })
      console.log('API: Создана новая заявка:', activeRequest.id)
    }

    // Обновляем заявку с новыми состояниями
    console.log('API: Обновляю заявку', activeRequest.id, 'с состояниями:', deviceConditions)
    const updatedRequest = await prisma.skupka.update({
      where: {
        id: activeRequest.id,
      },
      data: {
        deviceConditions: deviceConditions,
      },
    })
    console.log('API: Заявка обновлена:', updatedRequest.id)

    return NextResponse.json({
      success: true,
      message: 'Состояния устройства сохранены',
      requestId: updatedRequest.id,
    })
  } catch (error) {
    console.error('API: Ошибка сохранения состояний:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
