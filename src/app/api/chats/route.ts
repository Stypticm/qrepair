import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { notifyAllAdmins } from '@/lib/notifications/admin-notifications';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const chats = await api.list<any>('operator-chats', { telegramId });
    const chat = chats && chats.length > 0 ? chats[0] : null;
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
    const existingChats = await api.list<any>('operator-chats', { telegramId });
    let chat: any;
    if (existingChats && existingChats.length > 0) {
      chat = await api.patch('operator-chats', existingChats[0].id, {
        userNickname: username,
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
    } else {
      chat = await api.create('operator-chats', {
        telegramId,
        userNickname: username,
        status: 'active',
      });
    }

    // Create the message
    const message = await api.create<any>('operator-messages', {
      chatId: chat.id,
      senderId: telegramId,
      senderType: 'user',
      text,
    });

    // Notify Admins
    if (message) {
        const nickname = chat.userNickname || telegramId;
        await notifyAllAdmins({
            title: `💬 Новое сообщение: ${nickname}`,
            body: text.length > 50 ? text.substring(0, 50) + '...' : text,
            url: `/admin/chats?id=${chat.id}`
        });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
