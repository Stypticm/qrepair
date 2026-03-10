import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { telegramId, username, name, pointId } = body;

    if (!telegramId || !username) {
      return NextResponse.json(
        { error: 'Missing telegramId or username' },
        { status: 400 }
      );
    }

    // Go API JSON Server like filtering might not support OR directly in URL params easily
    // So we check both separately
    const existingByTgId = await api.list<any>('masters', { telegramId });
    const existingByUsername = await api.list<any>('masters', { username });

    if ((existingByTgId && existingByTgId.length > 0) || (existingByUsername && existingByUsername.length > 0)) {
      return NextResponse.json(
        { error: 'Master already exists with this telegramId or username' },
        { status: 409 }
      );
    }

    const master = await api.create<any>('masters', {
      telegramId,
      username,
      name: name || username,
      isActive: true,
      pointId: pointId ? parseInt(pointId) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      master: {
        id: master.id,
        telegramId: master.telegramId,
        username: master.username,
        name: master.name,
      },
    });
  } catch (error) {
    console.error('Error adding master:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
