import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function GET(req: NextRequest) {
  const telegramId = req.headers.get('x-telegram-id');
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active';

  if (!isAdminTelegramId(telegramId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Auto-archive inactive chats (older than 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.operatorChat.updateMany({
      where: {
        status: 'active',
        updatedAt: { lt: fiveDaysAgo }
      },
      data: { status: 'archived' }
    });

    // 2. Fetch chats by requested status
    const chats = await prisma.operatorChat.findMany({
      where: {
        status: status as any
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
