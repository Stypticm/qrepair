import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: chatId } = await params;
    const { status } = await req.json();

    if (!status || !['active', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedChat = await prisma.operatorChat.update({ where: { id: chatId }, data: { status } });
    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
