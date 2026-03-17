import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Базовая валидация
    if (!data.deviceModel || !data.category || !data.deliveryMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Создаем заявку на ремонт с явным ID
    const newId = crypto.randomUUID();
    const repairRequest = await api.create<any>('repair-requests', {
      id: newId,
      telegramId,
      deviceModel: data.deviceModel,
      serialNumber: data.serialNumber || null,
      category: data.category,
      issueDescription: data.issueDescription || null,
      issuePhotos: data.issuePhotos || [],
      estimatedMin: data.estimatedMin || null,
      estimatedMax: data.estimatedMax || null,
      deliveryMethod: data.deliveryMethod,
      clientContact: data.clientContact || null,
      clientAddress: data.clientAddress || null,
      appointmentDate: data.appointmentDate ? new Date(data.appointmentDate).toISOString() : null,
      appointmentTime: data.appointmentTime || null,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // После успешного создания отправляем уведомления всем админам и мастерам
    try {
        const { notifyUser } = await import('@/lib/notifications/user-notifications');
        const users = await api.list<any>('users');
        if (users && users.length > 0) {
            const staff = users.filter((u: any) => u.role === 'ADMIN' || u.role === 'MASTER');
            
            const title = 'Новая заявка на ремонт';
            const body = `${data.deviceModel} - ${data.issueDescription || 'Без описания'}`;
            
            // Отправляем всем параллельно
            await Promise.allSettled(
                staff.map((employee: any) => 
                   notifyUser(employee.telegramId, {
                       title,
                       body,
                       url: '/admin/repair' // общая админка
                   })
                )
            );
        }
    } catch (notifyErr) {
        console.error('[Repair Create] Failed to notify staff:', notifyErr);
    }

    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error creating repair request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
