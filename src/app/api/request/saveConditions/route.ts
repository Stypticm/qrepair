import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const { deviceConditions, price, currentStep, telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

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

    // Если заявки нет, создаем новую
    if (!activeRequest) {
      activeRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: 'Unknown',
          status: 'draft',
        },
      })
    }

    // Получаем текущие состояния из БД
    const currentRequest = await prisma.skupka.findUnique({
      where: { id: activeRequest.id },
      select: { deviceConditions: true },
    })

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

    const updatedRequest = await prisma.skupka.update({
      where: {
        id: activeRequest.id,
      },
      data: {
        deviceConditions: mergedConditions,
        price: price || undefined, // Сохраняем цену если она передана
        currentStep: currentStep || undefined, // Сохраняем текущий шаг
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Состояния устройства сохранены',
      requestId: updatedRequest.id,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
