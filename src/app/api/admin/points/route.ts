import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramId = req.headers.get('x-telegram-id');
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const points = await api.list<any>('points', {}, headers);
    return NextResponse.json({ points });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
