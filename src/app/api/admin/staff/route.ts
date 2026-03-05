import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, telegramId: true, role: true, createdAt: true }
    });
    return NextResponse.json({ success: true, users });
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

    if (!userId || !role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: { role: role as Role } });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
