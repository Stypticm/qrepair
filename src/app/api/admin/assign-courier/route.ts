import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRole } from '@/core/lib/auth';
import { NotificationService } from '@/services/notification.service';

export async function POST(request: NextRequest) {
  try {
    const { requestId, type, courierId, adminTelegramId } = await request.json();

    if (!requestId || !type || !courierId || !adminTelegramId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
        data: { 
          assignedCourier: { connect: { id: courierId } },
        },
      });
    } else if (type === 'SKUPKA') {
      updatedRecord = await prisma.skupka.update({
        where: { id: requestId },
        data: { 
          assignedCourier: { connect: { id: courierId } },
        },
      });
    }

    // Отправка уведомления
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
