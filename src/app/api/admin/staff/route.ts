import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await api.list<any>('users', { _sort: 'createdAt', _order: 'desc' });
    const mappedUsers = (users || []).map((u: any) => ({
        id: u.id,
        telegramId: u.telegramId,
        role: u.role,
        createdAt: u.createdAt
    }));
    return NextResponse.json({ success: true, users: mappedUsers });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, role } = await request.json();
    const allowedRoles = ['ADMIN', 'MANAGER', 'MASTER', 'COURIER', 'USER'];

    if (!userId || !role || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const updatedUser = await api.patch('users', userId, { role: role });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

