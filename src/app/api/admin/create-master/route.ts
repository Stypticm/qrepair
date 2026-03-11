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

    const { telegramId, username, name, pointId } = await req.json();

    if (!telegramId || !username || !name) {
      return NextResponse.json({ error: 'Telegram ID, username and name are required' }, { status: 400 });
    }

    const existingMasters = await api.list<any>('masters', { telegramId }, headers);

    if (existingMasters && existingMasters.length > 0) {
      return NextResponse.json({ error: 'Master with this Telegram ID already exists' }, { status: 400 });
    }

    if (pointId) {
      // Points endpoint needs to exist on Go side
      const points = await api.list<any>('points', { id: Number(pointId) }, headers); 
      if (!points || points.length === 0) {
        return NextResponse.json({ error: 'Point not found' }, { status: 400 });
      }
    }

    const master = await api.create<any>('masters', {
      telegramId, 
      username, 
      name, 
      isActive: true, 
      pointId: pointId ? Number(pointId) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, headers);

    return NextResponse.json({ success: true, master });
  } catch (error) {
    console.error('Error creating master:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
