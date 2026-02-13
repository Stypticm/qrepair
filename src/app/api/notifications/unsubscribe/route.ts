import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { endpoint } = await req.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
        }

        await prisma.pushSubscription.deleteMany({
            where: { endpoint }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
