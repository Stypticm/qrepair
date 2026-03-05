import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.quickLead.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking leads as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
