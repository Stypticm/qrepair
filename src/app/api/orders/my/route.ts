import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let telegramId = searchParams.get('telegramId')

    const initData = request.headers.get('x-telegram-init-data')
    if (initData) {
      try {
        const params = new URLSearchParams(initData)
        const userStr = params.get('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          telegramId = user.id?.toString() || telegramId
        }
      } catch (e) {
        console.error('Error parsing Telegram init data:', e)
      }
    }

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = searchParams.get('status')
    const filters: any = { telegramId }
    if (status) filters.status = status

    // Получаем заказы через Go API
    const allOrders = await api.list<any>('orders', filters);

    // Обогащаем данными о позициях заказа
    const ordersWithItems = await Promise.all(allOrders.map(async (order: any) => {
      try {
        // Получаем айтемы заказа
        const items = await api.list<any>('order-items', { orderId: order.id });
        
        // Обогащаем айтемы данными о лотах
        const itemsWithLots = await Promise.all(items.map(async (item: any) => {
          try {
            const lot = await api.get<any>('marketplace-lots', item.lotId);
            return { ...item, lot };
          } catch (e) {
            return item;
          }
        }));

        return { ...order, items: itemsWithLots };
      } catch (e) {
        return { ...order, items: [] };
      }
    }));

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
