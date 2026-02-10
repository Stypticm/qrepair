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

export async function GET(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const leads = await prisma.quickLead.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const lead = await prisma.quickLead.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
