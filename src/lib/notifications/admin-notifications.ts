import { prisma } from '@/lib/prisma';
import { sendPushNotification } from './web-push';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function notifyAllAdmins(payload: { title: string; body: string; url?: string }) {
    try {
        // 1. Fetch all subscriptions
        const subscriptions = await prisma.pushSubscription.findMany();
        console.log(`[Push] Total subscriptions in DB: ${subscriptions.length}`);

        // 2. Filter for admins only
        const adminSubscriptions = subscriptions.filter(sub => {
            const isAdmin = sub.userId && isAdminTelegramId(sub.userId);
            if (!isAdmin) {
                console.log(`[Push] Skipping non-admin subscription: ${sub.userId}`);
            }
            return isAdmin;
        });

        console.log(`[Push] Target admin subscriptions: ${adminSubscriptions.length}`);

        if (adminSubscriptions.length === 0) {
            console.log('[Push] No admin subscriptions found for broadcast');
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
