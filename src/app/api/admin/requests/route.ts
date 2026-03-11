import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    // Получаем заявки на ремонт через Go API
    const requests = await api.list<any>('repair-requests', {}, headers);

    // Обогащаем данными о мастере и курьере
    const enrichedRequests = await Promise.all(requests.map(async (req: any) => {
      try {
        const [master, courier] = await Promise.all([
          req.masterId ? api.get<any>('users', req.masterId, {}, headers).catch(() => null) : Promise.resolve(null),
          req.courierId ? api.get<any>('users', req.courierId, {}, headers).catch(() => null) : Promise.resolve(null)
        ]);
        return { ...req, assignedMaster: master, assignedCourier: courier };
      } catch (e) {
        return req;
      }
    }));

    return NextResponse.json({ success: true, requests: enrichedRequests });
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
