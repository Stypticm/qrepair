import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { lotId } = await request.json()

    if (!lotId) {
      return NextResponse.json({ error: 'ID лота обязателен' }, { status: 400 })
    }

    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    // Удаление через наш Go API
    await api.delete('marketplace-lots', lotId, headers);

    return NextResponse.json({ success: true, message: 'Лот успешно удален' })
  } catch (error: any) {
    console.error('Delete lot error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
