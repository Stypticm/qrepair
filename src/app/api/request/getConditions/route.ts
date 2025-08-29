import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем telegramId из заголовков
    const telegramId =
      request.headers.get('x-telegram-id') || 'test-user'
    console.log('API GET: telegramId:', telegramId)

    // Находим активную заявку пользователя
    let activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deviceConditions: true,
      },
    })
    console.log(
      'API GET: Найдена заявка:',
      activeRequest?.id || 'не найдена'
    )
    console.log(
      'API GET: Состояния в заявке:',
      activeRequest?.deviceConditions
    )

    // Если заявки нет, возвращаем пустые состояния
    if (!activeRequest) {
      console.log(
        'API GET: Заявка не найдена, возвращаю null'
      )
      return NextResponse.json({
        success: true,
        deviceConditions: null,
      })
    }

    console.log(
      'API GET: Возвращаю состояния:',
      activeRequest.deviceConditions
    )
    return NextResponse.json({
      success: true,
      deviceConditions: activeRequest.deviceConditions,
    })
  } catch (error) {
    console.error(
      'API GET: Ошибка получения состояний:',
      error
    )
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
