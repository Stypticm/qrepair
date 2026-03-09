import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const points = await api.list<any>('points');
    return NextResponse.json({ points });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
