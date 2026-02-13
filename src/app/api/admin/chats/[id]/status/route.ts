import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminTelegramId = req.headers.get('x-telegram-id');
  const { id: chatId } = await params;

  if (!isAdminTelegramId(adminTelegramId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !['active', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedChat = await prisma.operatorChat.update({
      where: { id: chatId },
      data: { status },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
