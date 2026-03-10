import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
    try {
        const { endpoint } = await req.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
        }

        const subscriptions = await api.list<any>('push-subscriptions', { endpoint });
        
        if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
                await api.delete('push-subscriptions', sub.id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

