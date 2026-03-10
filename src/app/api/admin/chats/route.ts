import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // Auto-archive stale active chats
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const staleChats = await api.list<any>('operator-chats', { status: 'active' });
    for (const chat of (staleChats || [])) {
      if (new Date(chat.updatedAt) < fiveDaysAgo) {
        await api.patch('operator-chats', chat.id, { status: 'archived' });
      }
    }

    const params: Record<string, string> = {};
    if (status !== 'all') params.status = status;
    const chats = await api.list<any>('operator-chats', { ...params, _sort: 'updatedAt', _order: 'desc' });

    return NextResponse.json({ success: true, chats: chats || [] });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
