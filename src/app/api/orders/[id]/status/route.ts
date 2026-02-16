import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { notifyUser } from '@/lib/notifications/user-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, courierName, courierPhone } = body

    // Валидация статуса
    const validStatuses = ['pending', 'confirmed', 'in_delivery', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Неверный статус' },
        { status: 400 }
      )
    }

    // Получаем текущий заказ
    const currentOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Подготавливаем данные для обновления
    const updateData: any = {}

    if (status) {
      updateData.status = status

      // Автоматически устанавливаем даты при смене статуса
      const now = new Date()
      if (status === 'confirmed' && !currentOrder.confirmedAt) {
        updateData.confirmedAt = now
      }
      if (status === 'in_delivery' && !currentOrder.inDeliveryAt) {
        updateData.inDeliveryAt = now
      }
      if (status === 'completed' && !currentOrder.completedAt) {
        updateData.completedAt = now
      }
    }

    if (notes !== undefined) {
      updateData.trackingNotes = notes
    }

    if (courierName !== undefined) {
      updateData.courierName = courierName
    }

    if (courierPhone !== undefined) {
      updateData.courierPhone = courierPhone
    }

    // Если заказ отменяется — возвращаем лоты в продажу
    if (status === 'cancelled') {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: id }
        })
        
        for (const item of orderItems) {
            await prisma.marketplaceLot.update({
                where: { id: item.lotId },
                data: { status: 'available' }
            })
        }
    }

    // Если заказ выполнен — помечаем лоты как проданные
    if (status === 'completed') {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: id }
        })
        
        for (const item of orderItems) {
            await prisma.marketplaceLot.update({
                where: { id: item.lotId },
                data: { status: 'sold', soldAt: new Date() }
            })
        }
    }

    // Обновляем заказ
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            lot: true
          }
        },
        pickupPoint: true
      }
    })

    // Отправляем уведомление пользователю об изменении статуса
    if (status && updatedOrder.telegramId) {
        const statusMap: any = {
            'confirmed': 'подтвержден',
            'in_delivery': 'передан в доставку',
            'completed': 'выполнен',
            'cancelled': 'отменен'
        }
        
        const statusText = statusMap[status]
        if (statusText) {
            await notifyUser(updatedOrder.telegramId, {
                title: 'Статус заказа изменен',
                body: `Ваш заказ #${id.slice(0, 8)} ${statusText}.`,
                url: `/my-devices`
            })
        }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Получаем ID пользователя из headers или тела запроса
    let userId: string | null = null;
    const initData = request.headers.get('x-telegram-init-data');
    
    if (initData) {
        try {
            const params = new URLSearchParams(initData);
            const userStr = params.get('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.id?.toString();
            }
        } catch (e) {
            console.error('[OrderDelete] Error parsing Telegram init data:', e);
        }
    }

    // Fallback: проверяем заголовок
    if (!userId) {
        userId = request.headers.get('x-telegram-id');
    }

    // Проверяем существование заказа
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    // Проверяем права доступа
    const { isAdminTelegramId } = await import('@/core/lib/admin');
    const isAdmin = userId ? isAdminTelegramId(userId) : false;

    if (!isAdmin) {
        // Для обычных пользователей: проверяем владельца и статус
        if (!userId || order.telegramId !== userId) {
            return NextResponse.json({ error: 'Нет прав для удаления этого заказа' }, { status: 403 });
        }
        // Разрешаем удаление только до начала доставки
        if (order.status === 'in_delivery' || order.status === 'completed') {
            return NextResponse.json({ error: 'Нельзя удалить заказ, который уже в доставке или завершен' }, { status: 403 });
        }
    }

    // Возвращаем лоты в продажу перед удалением
    const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id }
    });
    
    for (const item of orderItems) {
        await prisma.marketplaceLot.update({
            where: { id: item.lotId },
            data: { status: 'available' }
        });
    }

    // Удаляем заказ
    await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId: id } }),
        prisma.order.delete({ where: { id } })
    ])

    return NextResponse.json({ success: true, message: 'Заказ полностью удален' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
