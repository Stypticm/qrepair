import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      )
    }

    // Убираем # из ID если есть
    const cleanId = requestId.replace('#', '')

    // Ищем заявку по ID (последние 4 символа)
    const skupka = await prisma.skupka.findFirst({
      where: {
        id: {
          endsWith: cleanId,
        },
        status: 'submitted',
      },
      select: {
        id: true,
        modelname: true,
        price: true,
        pickupPoint: true,
        courierAddress: true,
        deliveryMethod: true,
      },
    })

    if (!skupka) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      request: {
        id: skupka.id,
        modelname: skupka.modelname,
        price: skupka.price,
        pickupPoint: skupka.pickupPoint,
        courierAddress: skupka.courierAddress,
        deliveryMethod: skupka.deliveryMethod,
      },
    })
  } catch (error) {
    console.error('Error verifying request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
