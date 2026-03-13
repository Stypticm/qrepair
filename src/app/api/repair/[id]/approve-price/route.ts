import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { choice } = await request.json();

    if (choice !== 'original' && choice !== 'non_original') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }

    // Получаем текущую заявку, чтобы взять цены
    const requestData = await api.get<any>('repair-requests', id);

    if (!requestData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (requestData.telegramId !== telegramId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (requestData.status !== 'price_approval') {
      return NextResponse.json({ error: 'Request is not in price_approval status' }, { status: 400 });
    }

    // Формируем payload обновления
    const finalPrice = choice === 'original' ? requestData.priceOriginal : requestData.priceNonOriginal;

    const updates = {
      clientPriceChoice: choice,
      finalPrice: finalPrice,
      status: 'repairing',
      updatedAt: new Date().toISOString(),
    };

    // Вызываем PATCH маршрут (или напрямую api), но лучше напрямую API чтобы не дублировать логику
    // Уведомление мастеру отправится при следующем шаге (мы обновили PATCH route)
    // Но так как мы вызываем напрямую api.patch, нам нужно отправить уведомление самим здесь
    const result = await api.patch<any>('repair-requests', id, updates);

    // Уведомить мастера, если он назначен
    if (result.assignedMasterId) {
      try {
        const master = await api.get<any>('masters', result.assignedMasterId);
        if (master && master.telegramId) {
            const { notifyUser } = await import('@/lib/notifications/user-notifications');
            await notifyUser(master.telegramId, {
                title: `Заявка #${String(id).slice(-6)}: Клиент подтвердил цену`,
                body: `Клиент выбрал запчасти: ${choice === 'original' ? 'Оригинал' : 'Аналог'}. Можете приступать к ремонту.`,
                url: `/admin/repair`
            });
        }
      } catch (e) {
        console.error('Failed to notify master:', e);
      }
    }

    return NextResponse.json({ success: true, request: result });
  } catch (error) {
    console.error('Error approving repair price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
