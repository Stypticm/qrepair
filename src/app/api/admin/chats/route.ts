import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRole } from '@/core/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const hasAccess = await checkRole(adminId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // 1. Auto-archive inactive chats (older than 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.operatorChat.updateMany({
      where: {
        status: 'active',
        updatedAt: { lt: fiveDaysAgo },
      },
      data: { status: 'archived' },
    });

    // 2. Fetch chats
    const chats = await prisma.operatorChat.findMany({
      where: status === 'all' ? {} : { status: status as any },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
