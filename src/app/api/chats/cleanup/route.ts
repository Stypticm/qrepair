import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const telegramId = searchParams.get('telegramId');

        if (!telegramId || !telegramId.startsWith('guest_')) {
            return NextResponse.json({ error: 'Invalid or missing guest ID' }, { status: 400 });
        }

        console.log(`🧹 Cleaning up guest chat: ${telegramId}`);

        // We use onDelete: Cascade in schema, so deleting the chat should delete messages
        await prisma.operatorChat.delete({
            where: {
                userTelegramId: telegramId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to cleanup guest chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
