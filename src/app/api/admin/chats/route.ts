import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.operatorChat.updateMany({
      where: { status: 'active', updatedAt: { lt: fiveDaysAgo } },
      data: { status: 'archived' },
    });

    const chats = await prisma.operatorChat.findMany({
      where: status === 'all' ? {} : { status: status as any },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
