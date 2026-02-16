import { prisma } from '@/lib/prisma';
import { isAdminTelegramId, ADMIN_TELEGRAM_IDS } from '@/core/lib/admin';
import { NotificationService } from '@/services/notification.service';

export async function notifyAllAdmins(payload: { title: string; body: string; url?: string }) {
    try {
        // 1. Fetch subscriptions for hardcoded admins
        // 2. Fetch subscriptions for users with ADMIN role in DB
        const adminSubscriptions = await prisma.pushSubscription.findMany({
            where: {
                OR: [
                    { telegramId: { in: ADMIN_TELEGRAM_IDS } },
                    { user: { role: 'ADMIN' } }
                ]
            }
        });

        console.log(`[Push] Target admin subscriptions: ${adminSubscriptions.length}`);

        if (adminSubscriptions.length === 0) {
            console.log('[Push] No admin subscriptions found for broadcast');
            return;
        }

        // 3. Send notifications via Service (to reuse cleanup logic)
        // Group by telegramId to avoid sending multiple if we have unique constraint on endpoint but multiple subs for one ID
        const uniqueAdminIds = Array.from(new Set(
            adminSubscriptions
                .map(s => s.telegramId)
                .filter((id): id is string => !!id)
        ));

        const results = await Promise.all(uniqueAdminIds.map(telegramId => 
            NotificationService.sendToUser(telegramId, {
                title: payload.title,
                message: payload.body,
                url: payload.url,
            })
        ));

        const totalSent = results.reduce((acc, r) => acc + (r.sent || 0), 0);
        console.log(`Sent admin notifications. Total successful deliveries: ${totalSent}`);

    } catch (error) {
        console.error('Error in notifyAllAdmins:', error);
    }
}
