import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subscription, userId } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Upsert: check if exists, then update or create
        const existing = await api.list<any>('push-subscriptions', { endpoint: subscription.endpoint });

        let result: any;
        if (existing && existing.length > 0) {
            result = await api.patch('push-subscriptions', existing[0].id, {
                telegramId: userId || null,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });
        } else {
            result = await api.create('push-subscriptions', {
                telegramId: userId || null,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });
        }

        return NextResponse.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
