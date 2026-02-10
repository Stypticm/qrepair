import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { isAdminTelegramId } from '@/core/lib/admin';

async function verifyAdmin(request: NextRequest) {
    const initData = request.headers.get('x-telegram-init-data');
    let userId: string | null = null;

    if (initData) {
        const params = new URLSearchParams(initData);
        const userStr = params.get('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            userId = user.id?.toString();
        }
    }

    if (!userId) {
        userId = request.headers.get('x-telegram-id');
    }

    return userId && isAdminTelegramId(userId);
}

export async function POST(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.quickLead.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking leads as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
