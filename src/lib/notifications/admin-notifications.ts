import { prisma } from '@/lib/prisma';
import { sendPushNotification } from './web-push';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function notifyAllAdmins(payload: { title: string; body: string; url?: string }) {
    try {
        // 1. Fetch all subscriptions
        const subscriptions = await prisma.pushSubscription.findMany();

        // 2. Filter for admins only
        // This relies on userId being the Telegram ID, which is how we store it.
        const adminSubscriptions = subscriptions.filter(sub => 
            sub.userId && isAdminTelegramId(sub.userId)
        );

        if (adminSubscriptions.length === 0) {
            console.log('No admin subscriptions found');
            return;
        }

        // 3. Send notifications
        const results = await Promise.all(adminSubscriptions.map(sub => {
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
        console.log(`Sent admin notifications: ${successCount}/${adminSubscriptions.length}`);

    } catch (error) {
        console.error('Error in notifyAllAdmins:', error);
    }
}
