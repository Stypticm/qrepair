import { prisma } from '@/lib/prisma';
import { sendPushNotification } from './web-push';

export async function notifyUser(userId: string, payload: { title: string; body: string; url?: string }) {
    try {
        // 1. Fetch all subscriptions for this user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            console.log(`[Push] No subscriptions found for user: ${userId}`);
            return;
        }

        console.log(`[Push] Sending notifications to ${subscriptions.length} devices for user: ${userId}`);

        // 2. Send notifications
        const results = await Promise.all(subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            return sendPushNotification(pushSubscription, {
                title: payload.title,
                body: payload.body,
                url: payload.url,
            });
        }));

        const successCount = results.filter(r => r.success).length;
        console.log(`Sent user notifications: ${successCount}/${subscriptions.length}`);

    } catch (error) {
        console.error(`[Push] Error in notifyUser for user ${userId}:`, error);
        if (error instanceof Error) {
            console.error(`[Push] Error stack:`, error.stack);
        }
    }
}
