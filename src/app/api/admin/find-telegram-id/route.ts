import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const masters = await api.list<any>('masters', { username });

    if (masters && masters.length > 0) {
      return NextResponse.json({ success: true, telegramId: masters[0].telegramId, source: 'master' });
    }

    const users = await api.list<any>('skupkas', { username });

    if (users && users.length > 0) {
      return NextResponse.json({ success: true, telegramId: users[0].telegramId, source: 'user' });
    }

    return NextResponse.json({ success: false, telegramId: null, message: 'User not found' });
  } catch (error) {
    console.error('Error finding Telegram ID:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
