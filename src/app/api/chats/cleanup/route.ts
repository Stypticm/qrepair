import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const telegramId = searchParams.get('telegramId');

        if (!telegramId || !telegramId.startsWith('guest_')) {
            return NextResponse.json({ error: 'Invalid or missing guest ID' }, { status: 400 });
        }

        console.log(`🧹 Cleaning up guest chat: ${telegramId}`);

        const chats = await api.list<any>('operator-chats', { telegramId });
        for (const chat of (chats || [])) {
            await api.delete('operator-chats', chat.id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to cleanup guest chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
