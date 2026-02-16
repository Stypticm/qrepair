import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/notifications/web-push';
import webpush from 'web-push';

export interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
}

export class NotificationService {
  /**
   * Sends a notification to all user's subscriptions
   */
  static async sendToUser(telegramId: string, payload: NotificationPayload) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { telegramId },
    });

    if (subscriptions.length === 0) {
      return { success: false, message: 'No subscriptions found', count: 0 };
    }

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription: webpush.PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const result = await sendPushNotification(pushSubscription, {
          title: payload.title,
          body: payload.message,
          icon: '/logo.png',
          url: payload.url || '/',
        });

        // Cleanup: If subscription is no longer valid, delete it
        if (!result.success && result.error) {
          const statusCode = (result.error as any).statusCode;
          if (statusCode === 410 || statusCode === 404) {
            console.log(`[NotificationService] Deleting expired subscription: ${sub.id}`);
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            }).catch(err => console.error('[NotificationService] Failed to delete subscription', err));
          }
        }

        return result;
      })
    );

    const successCount = results.filter((r) => r.success).length;

    return {
      success: true,
      sent: successCount,
      total: subscriptions.length,
    };
  }
}
