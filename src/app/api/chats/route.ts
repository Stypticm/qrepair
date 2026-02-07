import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const chat = await prisma.operatorChat.findUnique({
      where: { userTelegramId: telegramId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(chat || { messages: [] });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, username, text } = body;

    if (!telegramId || !text) {
      return NextResponse.json({ error: 'Telegram ID and text are required' }, { status: 400 });
    }

    // Upsert the chat
    const chat = await prisma.operatorChat.upsert({
      where: { userTelegramId: telegramId },
      update: { userNickname: username },
      create: {
        userTelegramId: telegramId,
        userNickname: username,
      },
    });

    // Create the message
    const message = await prisma.operatorMessage.create({
      data: {
        chatId: chat.id,
        senderId: telegramId,
        senderType: 'user',
        text,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
