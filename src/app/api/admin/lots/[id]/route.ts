import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const data = await request.json();
    const updated = await api.update('marketplace-lots', id, data, headers);
    return NextResponse.json({ success: true, lot: updated });
  } catch (error: any) {
    console.error('Update lot error:', error);
    return NextResponse.json({ error: error.message || 'Error updating product' }, { status: 500 });
  }
}
