import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const {
      deviceConditions,
      price,
      basePrice,
      discountPercent,
      currentStep,
      telegramId,
    } = await request.json()

    console.log(
      '🔍 API /saveConditions - получены данные:',
      {
        deviceConditions,
        price,
        basePrice,
        discountPercent,
        currentStep,
        telegramId,
      }
    )

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

    const updateData = {
      deviceConditions: mergedConditions,
      price: basePrice || undefined, // Базовая цена без поломок
      damagePercent: discountPercent || 0, // Процент скидки за поломки
      currentStep: currentStep || undefined, // Сохраняем текущий шаг
    }

    console.log(
      '🔄 API /saveConditions - обновляем запись:',
      {
        id: activeRequest.id,
        updateData,
        receivedData: {
          deviceConditions,
          price,
          basePrice,
          discountPercent,
          currentStep,
          telegramId,
        },
      }
    )

    const updatedRequest = await prisma.skupka.update({
      where: {
        id: activeRequest.id,
      },
      data: updateData,
    })

    console.log(
      '✅ API /saveConditions - запись обновлена:',
      {
        id: updatedRequest.id,
        price: updatedRequest.price,
        damagePercent: updatedRequest.damagePercent,
        deviceConditions: updatedRequest.deviceConditions,
      }
    )

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
