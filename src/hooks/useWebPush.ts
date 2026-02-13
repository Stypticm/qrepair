import { useState, useEffect } from 'react';
import { urlBase64ToUint8Array } from '@/lib/utils';

// You can find this in your .env or generated output
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC || process.env.VAPID_PUBLIC!;

export function useWebPush() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('[Push] Initializing useWebPush hook...');
        console.log('[Push] PUBLIC_VAPID_KEY present:', !!PUBLIC_VAPID_KEY);
        if (PUBLIC_VAPID_KEY) {
            console.log('[Push] VAPID Key start:', PUBLIC_VAPID_KEY.substring(0, 10) + '...');
        }

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                console.log('[Push] ServiceWorker ready:', reg.scope);
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        console.log('[Push] Found existing subscription:', sub.endpoint);
                        setSubscription(sub);
                        setIsSubscribed(true);
                    } else {
                        console.log('[Push] No existing subscription found');
                        setIsSubscribed(false);
                    }
                    setIsChecking(false);
                }).catch(err => {
                    console.error('[Push] Error getting subscription:', err);
                    setIsChecking(false);
                });
            }).catch(err => {
                console.error('[Push] Error waiting for ServiceWorker:', err);
                setIsChecking(false);
            });
        } else {
            console.warn('[Push] Push notifications not supported in this browser');
            setIsChecking(false);
        }
    }, []);

    const subscribe = async (userId?: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!registration) {
                throw new Error('Service Worker not ready');
            }
            if (!PUBLIC_VAPID_KEY) {
                throw new Error('Public VAPID Key not found');
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });

            setSubscription(sub);
            setIsSubscribed(true);

            // Send to backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: sub,
                    userId
                }),
            });
            console.log('Subscribed successfully');
        } catch (err: any) {
            console.error('Failed to subscribe:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!subscription) return;
            
            await subscription.unsubscribe();
            
            // Notify backend to remove subscription
            await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                }),
            });
            
            setSubscription(null);
            setIsSubscribed(false);
            console.log('Unsubscribed successfully');
        } catch (err: any) {
            console.error('Failed to unsubscribe:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, subscription, subscribe, unsubscribe, loading, error, isChecking };
}
