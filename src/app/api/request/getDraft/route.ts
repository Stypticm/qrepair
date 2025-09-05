import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { telegramId } = await req.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      )
    }

    // Ищем последнюю draft заявку пользователя
    const draftRequest = await prisma.skupka.findFirst({
      where: {
        telegramId,
        status: 'draft',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (!draftRequest) {
      console.log(
        'No draft found for telegramId:',
        telegramId
      )
      return NextResponse.json(null)
    }

    console.log('Found draft in DB:', {
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: draftRequest.price, // Базовая цена
      damagePercent: draftRequest.damagePercent, // Процент скидки
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
    })

    // Вычисляем финальную цену на основе базовой цены и процента скидки
    const basePrice = draftRequest.price || 0
    const damagePercent = draftRequest.damagePercent || 0
    const finalPrice = basePrice * (1 - damagePercent / 100)

    // Возвращаем данные заявки
    return NextResponse.json({
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: finalPrice, // Финальная цена (рассчитанная)
      basePrice: basePrice, // Базовая цена
      damagePercent: damagePercent, // Процент скидки
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      deviceConditions: draftRequest.deviceConditions,
      additionalConditions:
        draftRequest.additionalConditions,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
      createdAt: draftRequest.createdAt,
      updatedAt: draftRequest.updatedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
