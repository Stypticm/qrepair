import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { checkAdminAccessFromDB } from '@/core/lib/admin-server';

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем права: ADMIN/MANAGER видят все, MASTER видит назначенные на него
    const { hasAccess, role } = await checkAdminAccessFromDB(telegramId);
    
    if (!hasAccess && role !== 'MASTER' && role !== 'COURIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const params: any = {
      limit,
      order_by: 'createdAt desc',
      preload: 'User,AssignedMaster',
    };
    
    if (status) {
      params.status = status;
    }
    
    // Курьер видит только в транзите или ожидающие доставки
    if (role === 'COURIER') {
      // Пока что передаем как есть, в Go добавим поддержку IN через запятую
      params.status = 'courier_assigned,in_transit,ready_for_pickup';
    }

    const requests = await api.list<any>('repair-requests', params);

    // Маппим результат под формат Prisma (где user.telegramId и т.д.)
    // Go API возвращает user и assignedMaster как объекты
    const mappedRequests = requests.map(req => ({
      ...req,
      user: req.user ? { telegramId: req.user.telegramId } : null,
      assignedMaster: req.assignedMaster ? {
        name: req.assignedMaster.name,
        username: req.assignedMaster.username,
      } : null,
    }));

    return NextResponse.json({ requests: mappedRequests });
  } catch (error) {
    console.error('Error fetching repair requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
