import { api } from '@/services/api';
import { isAdminTelegramId, ADMIN_TELEGRAM_IDS } from '@/core/lib/admin';
import { NotificationService } from '@/services/notification.service';

export async function notifyAllAdmins(payload: { title: string; body: string; url?: string }) {
    try {        
        const [hardcodedSubs, roleSubs] = await Promise.all([
          api.list<any>('push-subscriptions', { telegramId: ADMIN_TELEGRAM_IDS.join(',') }),
          api.list<any>('users', { role: 'ADMIN' }).then(users => {
             const adminIds = users.map((u: any) => u.telegramId).filter(Boolean);
             if (adminIds.length === 0) return [];
             return api.list<any>('push-subscriptions', { telegramId: adminIds.join(',') });
          })
        ]);

        const adminSubscriptions = [...(hardcodedSubs || []), ...(roleSubs || [])];

        console.log(`[Push] Target admin subscriptions: ${adminSubscriptions.length}`);

        if (adminSubscriptions.length === 0) {
            console.log('[Push] No admin subscriptions found for broadcast');
            return;
        }

        const uniqueAdminIds = Array.from(new Set(
            adminSubscriptions
                .map((s: any) => s.telegramId)
                .filter((id: string | null | undefined): id is string => !!id)
        ));

        const results = await Promise.all(uniqueAdminIds.map(telegramId => 
            NotificationService.sendToUser(telegramId, {
                title: payload.title,
                message: payload.body,
                url: payload.url,
            })
        ));

        const totalSent = results.reduce((acc, r: any) => acc + (r.sent || 0), 0);
        console.log(`Sent admin notifications. Total successful deliveries: ${totalSent}`);

    } catch (error) {
        console.error('Error in notifyAllAdmins:', error);
    }
}
