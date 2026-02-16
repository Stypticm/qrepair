import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, amount, deliveryMethod, deliveryAddress, pickupPointId } = body

    if (!productId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: productId and amount are required' },
        { status: 400 }
      )
    }

    // Получаем информацию о лоте
    const lot = await prisma.marketplaceLot.findUnique({
      where: { id: productId }
    })

    if (!lot) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Создаем заказ
    // userId может быть null для гостей, в таком случае мы можем либо 
    // сохранять какой-то временный ID или просто оставлять поле пустым, 
    // если схема позволяет. В схеме Order.userId - String (обязательное).
    // Поэтому для гостей будем использовать специальный идентификатор или 
    // требовать передачу какого-то ID (например из Telegram WebApp)
    
    const order = await prisma.order.create({
      data: {
        userId: userId || 'guest_' + Date.now(),
        totalPrice: amount,
        deliveryMethod: deliveryMethod || 'pickup',
        deliveryAddress: deliveryAddress || '',
        pickupPointId: pickupPointId || null,
        status: 'pending',
        items: {
          create: {
            lotId: lot.id,
            title: lot.title,
            price: lot.price
          }
        }
      },
      include: {
        items: true
      }
    })

    // Обновляем статус лота на 'reserved', чтобы он скрылся из каталога
    await prisma.marketplaceLot.update({
      where: { id: productId },
      data: { status: 'reserved' }
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
