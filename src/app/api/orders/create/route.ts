import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deliveryMethod, pickupPointId, pickupAddress, deliveryAddress, deliveryDate, deliveryTime, items } = body

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

    // Проверяем товары из запроса
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      )
    }

    // Вычисляем общую сумму
    const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0)

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        userId,
        deliveryMethod,
        deliveryAddress,
        pickupPointId,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTime,
        totalPrice,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            lotId: item.id,
            title: item.title,
            price: item.price || 0,
          }))
        }
      },
      include: {
        items: true,
        pickupPoint: true
      }
    })

    // Очищаем корзину в БД (если есть)
    await prisma.cartItem.deleteMany({
      where: { userId }
    }).catch(() => {})

    // Обновляем статус лотов на 'reserved'
    await prisma.marketplaceLot.updateMany({
      where: {
        id: { in: items.map((item: any) => item.id) }
      },
      data: { status: 'reserved' }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
