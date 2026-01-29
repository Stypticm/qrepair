import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры фильтрации
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending' | 'confirmed' | 'in_delivery' | 'completed'

    // Формируем фильтр
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Получаем все заказы (админ)
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            lot: true
          }
        },
        pickupPoint: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
