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
        status: 'draft' 
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!draftRequest) {
      return NextResponse.json(null)
    }

    // Возвращаем данные заявки
    return NextResponse.json({
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: draftRequest.price,
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      deviceConditions: draftRequest.deviceConditions,
      additionalConditions: draftRequest.additionalConditions,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
      createdAt: draftRequest.createdAt,
      updatedAt: draftRequest.updatedAt
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
