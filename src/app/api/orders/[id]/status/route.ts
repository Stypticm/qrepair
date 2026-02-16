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
    if (status && updatedOrder.userId) {
        const statusMap: any = {
            'confirmed': 'подтвержден',
            'in_delivery': 'передан в доставку',
            'completed': 'выполнен',
            'cancelled': 'отменен'
        }
        
        const statusText = statusMap[status]
        if (statusText) {
            await notifyUser(updatedOrder.userId, {
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
