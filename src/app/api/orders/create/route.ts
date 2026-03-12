import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      telegramId: bodyTelegramId,
      productId,
      amount,
      deliveryMethod,
      deliveryAddress,
      pickupPointId,
      items: requestItems,
      deliveryDate,
      deliveryTime,
    } = body

    // Собираем заголовки аутентификации для Go API
    const headers: Record<string, string> = {}
    const telegramIdHeader = request.headers.get('x-telegram-id')
    const authHeader = request.headers.get('authorization')

    let finalTelegramId = bodyTelegramId || telegramIdHeader || undefined

    const initData = request.headers.get('x-telegram-init-data')
    if (!finalTelegramId && initData) {
      try {
        const params = new URLSearchParams(initData)
        const userStr = params.get('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          finalTelegramId = user.id?.toString()
        }
      } catch (e) {
        console.error('[OrderCreate] Error parsing Telegram init data:', e)
      }
    }

    if (finalTelegramId) {
      headers['x-telegram-id'] = finalTelegramId
    }
    if (authHeader) {
      headers['authorization'] = authHeader
    }

    console.log(`[OrderCreate] Final Identity: ${finalTelegramId || 'GUEST'}`);

    let orderItemsData: { lotId: string; title: string; price: number }[] = [];
    let calculatedTotalPrice = 0;

    if (requestItems && Array.isArray(requestItems) && requestItems.length > 0) {
      for (const item of requestItems) {
        const price = Number(item.price) || 0
        orderItemsData.push({
          lotId: item.lotId || item.id,
          title: item.title,
          price,
        });
        calculatedTotalPrice += price * (item.quantity || 1);
      }
    } else if (productId && amount) {
      const lot = await api.get<any>('marketplace-lots', productId, undefined, headers);
      const price = Number(lot.price) || 0
      orderItemsData.push({
        lotId: lot.id,
        title: lot.title,
        price,
      });
      calculatedTotalPrice = Number(amount) || price;
    } else {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Создаем заказ через Go API
    const order = await api.create<any>('orders', {
      telegramId: finalTelegramId || 'guest_' + Date.now(),
      totalPrice: calculatedTotalPrice,
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryAddress: deliveryAddress || '',
      pickupPointId: pickupPointId || null,
      deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
      deliveryTime: deliveryTime || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, headers);

    // Создаем айтемы заказа
    const createdItems = [];
    for (const itemData of orderItemsData) {
      const orderItem = await api.create<any>('order-items', {
        orderId: order.id,
        lotId: itemData.lotId,
        title: itemData.title,
        price: itemData.price,
        quantity: 1 // В данной реализации 1, можно расширить
      }, headers);
      createdItems.push(orderItem);

      // Обновляем статус лота
      await api.patch('marketplace-lots', itemData.lotId, { status: 'reserved' }, headers);
    }

    // Отправляем уведомления
    try {
      const { notifyAllAdmins } = await import('@/lib/notifications/admin-notifications');
      const { notifyUser } = await import('@/lib/notifications/user-notifications');

      await notifyAllAdmins({
        title: '🛒 Новый заказ',
        body: `Заказ #${order.id.slice(0, 8)} на сумму ${calculatedTotalPrice.toLocaleString('ru-RU')} ₽`,
        url: '/admin/orders'
      });

      if (finalTelegramId && !finalTelegramId.startsWith('guest_')) {
        await notifyUser(finalTelegramId, {
          title: '✅ Заказ создан',
          body: `Ваш заказ успешно создан. Ожидайте подтверждения.`,
          url: '/my-devices'
        });
      }
    } catch (notifError) {
      console.error('[OrderCreate] Failed to send notifications:', notifError);
    }

    return NextResponse.json({ success: true, order: { ...order, items: createdItems }, orderId: order.id })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
