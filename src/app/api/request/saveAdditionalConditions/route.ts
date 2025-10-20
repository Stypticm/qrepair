import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      additionalConditions,
      currentStep,
    } = await request.json()

    console.log(
      '[saveAdditionalConditions] Получены данные:',
      { telegramId, additionalConditions, currentStep }
    )

    if (!telegramId || !additionalConditions) {
      console.error(
        '[saveAdditionalConditions] Отсутствуют обязательные поля:',
        { telegramId, additionalConditions }
      )
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Находим активную заявку пользователя
    console.log(
      '[saveAdditionalConditions] Ищем активную заявку для telegramId:',
      telegramId
    )

    const currentRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      select: {
        id: true,
        additionalConditions: true,
        deviceConditions: true,
        telegramId: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(
      '[saveAdditionalConditions] Найденная заявка:',
      currentRequest
    )

    if (!currentRequest) {
      console.log(
        '[saveAdditionalConditions] Активная заявка не найдена, создаем новую для telegramId:',
        telegramId
      )

      // Создаем новую заявку
      const newRequest = await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: telegramId,
          modelname: 'Unknown',
          price: 0,
          status: 'draft',
          currentStep:
            currentStep || 'additional-condition',
          additionalConditions: additionalConditions,
          photoUrls: [],
        },
      })

      console.log(
        '[saveAdditionalConditions] Создана новая заявка:',
        newRequest.id
      )

      return NextResponse.json({
        success: true,
        additionalConditions: additionalConditions,
        requestId: newRequest.id,
      })
    }

    // Объединяем в deviceConditions
    const mergedDeviceConditions = {
      ...((currentRequest?.deviceConditions as any) || {}),
      ...(additionalConditions || {}),
    }

    console.log(
      '[saveAdditionalConditions] Обновляем заявку с данными:',
      {
        telegramId,
        mergedConditions: mergedDeviceConditions,
        currentStep,
      }
    )

    // Обновляем заявку с новыми условиями (в deviceConditions)
    const updatedRequest = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: {
        deviceConditions: mergedDeviceConditions as any,
        additionalConditions: Prisma.DbNull, // чистим legacy (DB NULL)
        currentStep: currentStep || undefined,
      },
    })

    console.log(
      '[saveAdditionalConditions] Успешно обновлено записей:',
      updatedRequest.count
    )

    return NextResponse.json({
      success: true,
      deviceConditions: mergedDeviceConditions,
    })
  } catch (error) {
    console.error(
      '[saveAdditionalConditions] Ошибка при сохранении:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
