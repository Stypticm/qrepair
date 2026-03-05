import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const courier = await prisma.user.findUnique({
      where: { id: courierId },
      include: { pushSubscriptions: true }
    });

    if (!courier) {
      return NextResponse.json({ error: 'Courier not found' }, { status: 404 });
    }

    let updatedRecord;
    if (type === 'REPAIR') {
      updatedRecord = await prisma.repairRequest.update({
        where: { id: requestId },
        data: {
          assignedCourier: { connect: { id: courierId } },
          status: 'courier_assigned'
        },
      });
    } else if (type === 'ORDER') {
      updatedRecord = await prisma.order.update({
        where: { id: requestId },
        data: { assignedCourier: { connect: { id: courierId } } },
      });
    } else if (type === 'SKUPKA') {
      updatedRecord = await prisma.skupka.update({
        where: { id: requestId },
        data: { assignedCourier: { connect: { id: courierId } } },
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
