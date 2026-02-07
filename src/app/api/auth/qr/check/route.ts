import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
        return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
    }

    try {
        const data = await prisma.authRequest.findUnique({
            where: { id: uuid }
        });

        if (!data) {
            return NextResponse.json({ status: 'not_found' });
        }

        // Map Prisma model field names to expected JSON response
        return NextResponse.json({
            status: data.status,
            telegram_id: data.telegramId,
            telegram_username: data.telegramUsername,
            telegram_data: data.telegramData
        });
    } catch (error: any) {
        console.error('[AUTH_QR] Check Error:', error);
        return NextResponse.json({ error: 'Failed to check status', message: error.message }, { status: 500 });
    }
}
