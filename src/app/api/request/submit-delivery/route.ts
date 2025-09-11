import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      modelname,
      price,
      deliveryMethod,
      pickupPoint,
      courierAddress,
      courierDate,
      courierTime,
    } = await request.json()

    console.log('🔍 Submit-delivery API received:', {
      telegramId,
      modelname,
      price,
      deliveryMethod,
      pickupPoint,
      courierAddress,
      courierDate,
      courierTime,
    })

    if (!telegramId || !modelname || !deliveryMethod) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      modelname: modelname,
      price: price,
      priceAgreed: true,
      deliveryMethod: deliveryMethod,
    }

    if (deliveryMethod === 'pickup') {
      updateData.pickupPoint = pickupPoint
    } else if (deliveryMethod === 'courier') {
      updateData.courierAddress = courierAddress
      updateData.courierDate = courierDate
        ? new Date(courierDate)
        : null
      updateData.courierTime = courierTime
    }

    // Обновляем запись в базе данных
    const updatedSkupka = await prisma.skupka.updateMany({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      data: updateData,
    })

    if (updatedSkupka.count === 0) {
      // Если запись не найдена, создаем новую
      await prisma.skupka.create({
        data: {
          telegramId: telegramId,
          username: telegramId, // Используем telegramId как username
          modelname: modelname,
          price: price,
          priceAgreed: true,
          deliveryMethod: deliveryMethod,
          pickupPoint: pickupPoint,
          courierAddress: courierAddress,
          courierDate: courierDate
            ? new Date(courierDate)
            : null,
          courierTime: courierTime,
          status: 'draft', // Оставляем как draft до финального подтверждения
          photoUrls: [],
        },
      })
    }

    // Сохраняем данные в sessionStorage для финальной страницы
    const deliveryData = {
      deliveryMethod,
      pickupPoint,
      courierAddress,
      courierDate,
      courierTime,
    }

    return NextResponse.json({
      success: true,
      deliveryData,
    })
  } catch (error) {
    console.error(
      'Ошибка при сохранении данных доставки:',
      error
    )
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
