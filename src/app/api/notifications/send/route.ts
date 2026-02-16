import { NextRequest, NextResponse } from 'next/server';
import { isAdminTelegramId } from '@/core/lib/admin';
import { NotificationService } from '@/services/notification.service';

async function verifyAdmin(request: NextRequest) {
    const initData = request.headers.get('x-telegram-init-data');
    let userId: string | null = null;

    if (initData) {
        try {
            const params = new URLSearchParams(initData);
            const userStr = params.get('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.id?.toString();
            }
        } catch (e) {
            console.error('Error parsing initData:', e);
        }
    }

    if (!userId) {
        userId = request.headers.get('x-telegram-id');
    }

    return userId && isAdminTelegramId(userId);
}

export async function POST(req: NextRequest) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId: telegramId, title, message, url } = body;

        if (!telegramId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await NotificationService.sendToUser(telegramId, {
            title,
            message,
            url
        });

        if (!result.success && result.count === 0) {
            return NextResponse.json({ message: result.message }, { status: 404 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
