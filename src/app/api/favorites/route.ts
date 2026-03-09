import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    // Получаем избранное через Go API
    const favoriteItems = await api.list<any>('favorite-items', { telegramId });

    // Обогащаем данными о лотах
    const formattedItems = await Promise.all(favoriteItems.map(async (item: any) => {
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
          addedAt: item.addedAt
        };
      } catch (e) {
        return null;
      }
    }));

    return NextResponse.json({
      success: true,
      favorites: formattedItems.filter(Boolean),
    })
  } catch (error: any) {
    console.error('Get favorites error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lotId, action } = await request.json()
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    if (!lotId || !action) return NextResponse.json({ error: 'ID лота и действие обязательны' }, { status: 400 });

    if (action === 'add') {
      await api.get('marketplace-lots', lotId);
      const existing = await api.list<any>('favorite-items', { telegramId, lotId });
      
      if (existing.length === 0) {
        await api.create('favorite-items', { telegramId, lotId, addedAt: new Date().toISOString() });
      }
      return NextResponse.json({ success: true, message: 'Добавлено в избранное' });
    }

    if (action === 'remove') {
      const existing = await api.list<any>('favorite-items', { telegramId, lotId });
      for (const item of existing) {
        await api.delete('favorite-items', item.id);
      }
      return NextResponse.json({ success: true, message: 'Удалено из избранного' });
    }

    if (action === 'toggle') {
      const existing = await api.list<any>('favorite-items', { telegramId, lotId });
      if (existing.length > 0) {
        await api.delete('favorite-items', existing[0].id);
        return NextResponse.json({ success: true, isFavorite: false, message: 'Удалено из избранного' });
      } else {
        await api.create('favorite-items', { telegramId, lotId, addedAt: new Date().toISOString() });
        return NextResponse.json({ success: true, isFavorite: true, message: 'Добавлено в избранное' });
      }
    }

    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
  } catch (error: any) {
    console.error('Favorites error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
