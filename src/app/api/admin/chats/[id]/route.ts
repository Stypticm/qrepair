import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const telegramId = req.headers.get('x-telegram-id');
  const chatId = params.id;

  if (!isAdminTelegramId(telegramId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chat = await prisma.operatorChat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminTelegramId = req.headers.get('x-telegram-id');
  const chatId = params.id;

  if (!isAdminTelegramId(adminTelegramId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const message = await prisma.operatorMessage.create({
      data: {
        chatId,
        senderId: adminTelegramId!,
        senderType: 'admin',
        text,
      },
    });

    // Update the updatedAt field of the chat
    await prisma.operatorChat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
