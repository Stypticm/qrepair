import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const evaluations = await api.list<any>('trade-in-evaluations', { _sort: 'createdAt', _order: 'desc' });
    return NextResponse.json(evaluations || []);
  } catch (error) {
    console.error('Error fetching trade-in evaluations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
