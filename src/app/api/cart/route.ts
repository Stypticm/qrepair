import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    let telegramId = request.headers.get('x-telegram-id') || 'browser_test_user'

    // Получаем элементы корзины через Go API с фильтрацией по telegramId
    const cartItems = await api.list<any>('cart-items', { telegramId });

    // Обогащаем данными о лотах
    const formattedItems = await Promise.all(cartItems.map(async (item: any) => {
      try {
        const lot = await api.get<any>('marketplace-lots', item.lotId);
        return {
          id: lot.id,
          title: lot.title,
          price: lot.price,
          cover: lot.coverPhoto,
          photos: lot.photos,
          date: lot.createdAt,
          model: lot.model,
          storage: lot.storage,
          color: lot.color,
          condition: lot.condition,
          description: lot.description,
          quantity: item.quantity
        };
      } catch (e) {
        console.error(`Lot ${item.lotId} not found for cart item ${item.id}`);
        return null;
      }
    }));

    return NextResponse.json({
      success: true,
      cartItems: formattedItems.filter(Boolean),
    })
  } catch (error: any) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lotId, action, quantity } = await request.json()
    let telegramId = request.headers.get('x-telegram-id') || 'browser_test_user'

    if (!action) return NextResponse.json({ error: 'Действие обязательно' }, { status: 400 });

    if (action === 'add') {
      if (!lotId) return NextResponse.json({ error: 'ID лота обязателен' }, { status: 400 });

      // Проверяем существование лота
      await api.get('marketplace-lots', lotId);

      // Проверяем, есть ли уже такой лот в корзине
      const existingItems = await api.list<any>('cart-items', { telegramId, lotId });
      
      if (existingItems.length > 0) {
        const item = existingItems[0];
        await api.patch('cart-items', item.id, {
          quantity: item.quantity + (quantity || 1)
        });
      } else {
        await api.create('cart-items', {
          telegramId,
          lotId,
          quantity: quantity || 1,
          addedAt: new Date().toISOString()
        });
      }

      return NextResponse.json({ success: true, message: 'Добавлено в корзину' });
    }

    if (action === 'remove') {
      if (!lotId) return NextResponse.json({ error: 'ID лота обязателен' }, { status: 400 });
      
      const items = await api.list<any>('cart-items', { telegramId, lotId });
      for (const item of items) {
        await api.delete('cart-items', item.id);
      }

      return NextResponse.json({ success: true, message: 'Удалено из корзины' });
    }

    if (action === 'updateQuantity') {
      if (!lotId || quantity === undefined) return NextResponse.json({ error: 'Параметры обязательны' }, { status: 400 });

      const items = await api.list<any>('cart-items', { telegramId, lotId });
      if (items.length > 0) {
        if (quantity <= 0) {
          await api.delete('cart-items', items[0].id);
        } else {
          await api.patch('cart-items', items[0].id, { quantity });
        }
      }

      return NextResponse.json({ success: true, message: 'Количество обновлено' });
    }

    if (action === 'clear') {
      const items = await api.list<any>('cart-items', { telegramId });
      for (const item of items) {
        await api.delete('cart-items', item.id);
      }
      return NextResponse.json({ success: true, message: 'Корзина очищена' });
    }

    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
  } catch (error: any) {
    console.error('Cart error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
