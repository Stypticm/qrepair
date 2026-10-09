import webpush from 'web-push';

// Configure web-push with VAPID keys
// Ideally these should be in process.env
// You can generate them using: npx web-push generate-vapid-keys

// You can generate them using: npx web-push generate-vapid-keys

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE!;

let hasWarnedVapid = false;

if (!publicVapidKey || !privateVapidKey) {
    if (process.env.NODE_ENV !== 'production' && !hasWarnedVapid) {
        hasWarnedVapid = true;
        console.warn('[web-push] VAPID keys not configured. Set VAPID_PUBLIC / VAPID_PRIVATE in .env to enable web push notifications.');
    }
} else {
    try {
        webpush.setVapidDetails(
            'mailto:admin@qoqos.ru',
            publicVapidKey,
            privateVapidKey
        );
    } catch (e) {
        // ignore invalid keys
    }
}

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
}

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: PushPayload
) {
    try {
        console.log('Sending push notification:', {
            title: payload.title,
            endpoint: subscription.endpoint,
        });
        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        return { success: true };
    } catch (error: any) {
        console.error(`[Push] Error sending push to ${subscription.endpoint}:`, {
            statusCode: error.statusCode,
            body: error.body,
            message: error.message
        });
        return { success: false, error };
    }
}
