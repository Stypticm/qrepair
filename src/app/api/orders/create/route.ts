import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, productId, amount, deliveryMethod, deliveryAddress, pickupPointId, items: requestItems } = body

    console.log(`[OrderCreate] Request from telegramId: ${telegramId}, items count: ${requestItems?.length || 0}`);

    // Подготавливаем массив товаров для создания OrderItem
    let orderItemsData = [];
    let calculatedTotalPrice = 0;

    if (requestItems && Array.isArray(requestItems) && requestItems.length > 0) {
        // Если передан массив товаров (из корзины)
        for (const item of requestItems) {
            orderItemsData.push({
                lotId: item.lotId || item.id,
                title: item.title,
                price: item.price
            });
            calculatedTotalPrice += item.price * (item.quantity || 1);
        }
    } else if (productId && amount) {
        // Если передан один товар (обратная совместимость)
        const lot = await prisma.marketplaceLot.findUnique({
            where: { id: productId }
        });

        if (!lot) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        orderItemsData.push({
            lotId: lot.id,
            title: lot.title,
            price: lot.price
        });
        calculatedTotalPrice = amount;
    } else {
        return NextResponse.json(
            { error: 'Missing required fields: items or productId+amount are required' },
            { status: 400 }
        );
    }

    // Создаем заказ
    const order = await prisma.order.create({
        data: {
            telegramId: telegramId || 'guest_' + Date.now(),
            totalPrice: calculatedTotalPrice,
            deliveryMethod: deliveryMethod || 'pickup',
            deliveryAddress: deliveryAddress || '',
            pickupPointId: pickupPointId || null,
            status: 'pending',
            items: {
                create: orderItemsData
            }
        },
        include: {
            items: true
        }
    });

    // Обновляем статус лотов на 'reserved'
    for (const item of orderItemsData) {
        await prisma.marketplaceLot.update({
            where: { id: item.lotId },
            data: { status: 'reserved' }
        });
    }

    return NextResponse.json({ success: true, order, orderId: order.id })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
