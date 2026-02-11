import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/notifications/web-push';

// This endpoint should be protected by Admin Auth in production!
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, title, message, url } = body;

        if (!userId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find all subscriptions for this user
        // In a real app, you might want to send to all of them
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions found for user' }, { status: 404 });
        }

        const results = await Promise.all(subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            return sendPushNotification(pushSubscription, {
                title,
                body: message,
                icon: '/logo.png', // Default icon
                url: url || '/',
            });
        }));

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({ 
            success: true, 
            sent: successCount, 
            total: subscriptions.length 
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
