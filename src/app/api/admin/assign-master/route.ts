import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramIdHeader = req.headers.get('x-telegram-id');
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramIdHeader) headers['x-telegram-id'] = telegramIdHeader;
    if (authHeader) headers['authorization'] = authHeader;

    const { masterId, pointId } = await req.json();

    if (!masterId || !pointId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const points = await api.list<any>('points', { id: Number(pointId) }, headers); 

    if (!points || points.length === 0) {
      return NextResponse.json({ error: 'Point not found' }, { status: 404 });
    }

    const master = await api.patch<any>('masters', masterId, {
      pointId: Number(pointId),
      updatedAt: new Date().toISOString()
    }, headers);

    return NextResponse.json({ success: true, master });
  } catch (error) {
    console.error('Error assigning master:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
