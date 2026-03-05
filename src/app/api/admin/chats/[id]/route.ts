import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const chat = await prisma.operatorChat.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { message } = await request.json();

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const newMessage = await prisma.operatorMessage.create({
      data: { chatId: id, senderId: auth.user.telegramId, senderType: 'admin', text: message },
    });

    await prisma.operatorChat.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
