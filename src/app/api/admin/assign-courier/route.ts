import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';
import { NotificationService } from '@/services/notification.service';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId, type, courierId } = await request.json();

    if (!requestId || !type || !courierId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const couriers = await api.list<any>('users', { id: courierId });
    const courier = couriers && couriers.length > 0 ? couriers[0] : null;

    if (!courier) {
      return NextResponse.json({ error: 'Courier not found' }, { status: 404 });
    }

    let updatedRecord: any;
    if (type === 'REPAIR') {
      updatedRecord = await api.patch('repair-requests', requestId, {
        assignedCourierId: courierId,
        status: 'courier_assigned',
      });
    } else if (type === 'ORDER') {
      updatedRecord = await api.patch('orders', requestId, {
        assignedCourierId: courierId,
      });
    } else if (type === 'SKUPKA') {
      updatedRecord = await api.patch('skupkas', requestId, {
        assignedCourierId: courierId,
      });
    }

    await NotificationService.sendToUser(courier.telegramId, {
      title: '📦 Новое назначение',
      message: `Вам назначен новый заказ #${requestId.slice(-4)}. Проверьте детали в приложении.`,
      url: type === 'REPAIR'
        ? `/request/track/${requestId}`
        : type === 'ORDER'
          ? `/orders/${requestId}`
          : `/admin/requests`
    });

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error) {
    console.error('Error assigning courier:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
