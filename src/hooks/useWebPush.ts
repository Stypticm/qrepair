import { useState, useEffect } from 'react';
import { urlBase64ToUint8Array } from '@/lib/utils';

// You can find this in your .env or generated output
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC || process.env.VAPID_PUBLIC!;

export function useWebPush() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setSubscription(sub);
                        setIsSubscribed(true);
                    }
                });
            });
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

    return { isSubscribed, subscription, subscribe, unsubscribe, loading, error };
}
