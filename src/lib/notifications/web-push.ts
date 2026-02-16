import webpush from 'web-push';

// Configure web-push with VAPID keys
// Ideally these should be in process.env
// You can generate them using: npx web-push generate-vapid-keys

// You can generate them using: npx web-push generate-vapid-keys

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE!;

if (!publicVapidKey || !privateVapidKey) {
    console.warn('⚠️ VAPID keys are missing! Notifications will not work.');
} else {
    webpush.setVapidDetails(
        'mailto:admin@qoqos.ru', // Replace with your email
        publicVapidKey,
        privateVapidKey
    );
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
