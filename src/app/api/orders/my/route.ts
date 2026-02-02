import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем userId из headers (Telegram WebApp)
    const initData = request.headers.get('x-telegram-init-data')
    let userId = 'browser_test_user' // fallback для браузера

    if (initData) {
      try {
        const params = new URLSearchParams(initData)
        const userStr = params.get('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          userId = user.id?.toString() || userId
        }
      } catch (e) {
        console.error('Error parsing Telegram init data:', e)
      }
    }

    // Получаем параметры фильтрации
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending' | 'confirmed' | 'in_delivery' | 'completed'

    // Формируем фильтр
    const where: any = { userId }
    if (status) {
      where.status = status
    }

    // Получаем заказы пользователя
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
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
