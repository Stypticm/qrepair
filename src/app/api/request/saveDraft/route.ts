import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      username,
      requestId,
      currentStep,
      deviceFunctionStates,
      devicePhotos,
      deliveryData,
      functionDiscount,
    } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Создаём или обновляем черновик
    const draftData = {
      telegramId,
      username: username || telegramId, // Fallback на telegramId если username нет
      currentStep: currentStep || 'evaluation-mode',
      deviceFunctionStates: deviceFunctionStates
        ? JSON.stringify(deviceFunctionStates)
        : null,
      devicePhotos: devicePhotos
        ? JSON.stringify(devicePhotos)
        : null,
      deliveryData: deliveryData
        ? JSON.stringify(deliveryData)
        : null,
      functionDiscount: functionDiscount || 0,
      updatedAt: new Date(),
    }

    let draft

    if (requestId) {
      // Обновляем существующий черновик
      draft = await prisma.skupka.update({
        where: { id: requestId },
        data: draftData,
      })
    } else {
      // Создаём новый черновик
      draft = await prisma.skupka.create({
        data: {
          ...draftData,
          status: 'draft',
          createdAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      requestId: draft.id,
      currentStep: draft.currentStep,
    })
  } catch (error) {
    console.error('Ошибка при сохранении черновика:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')
    const requestId = searchParams.get('requestId')

    if (!telegramId && !requestId) {
      return NextResponse.json(
        { error: 'Telegram ID or Request ID is required' },
        { status: 400 }
      )
    }

    let draft

    if (requestId) {
      draft = await prisma.skupka.findUnique({
        where: { id: requestId },
      })
    } else {
      // telegramId гарантированно не null из-за проверки выше
      draft = await prisma.skupka.findFirst({
        where: {
          telegramId: telegramId!, // Type assertion - мы знаем, что telegramId не null
          status: 'draft',
        },
        orderBy: { updatedAt: 'desc' },
      })
    }

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Парсим JSON поля
    const parsedDraft = {
      ...draft,
      deviceFunctionStates: draft.deviceFunctionStates
        ? JSON.parse(draft.deviceFunctionStates)
        : null,
      devicePhotos: draft.devicePhotos
        ? JSON.parse(draft.devicePhotos)
        : null,
      deliveryData: draft.deliveryData
        ? JSON.parse(draft.deliveryData)
        : null,
    }

    return NextResponse.json({
      success: true,
      draft: parsedDraft,
    })
  } catch (error) {
    console.error('Ошибка при получении черновика:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
