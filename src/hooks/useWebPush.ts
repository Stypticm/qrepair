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
        
        let mounted = true;

        async function checkSubscription() {
            try {
                if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
                    console.warn('[Push] Push notifications not supported');
                    if (mounted) setIsChecking(false);
                    return;
                }

                // Use getRegistration instead of .ready to avoid hanging
                const reg = await navigator.serviceWorker.getRegistration('/sw.js') || 
                            await navigator.serviceWorker.getRegistration();

                if (reg) {
                    console.log('[Push] ServiceWorker registration found:', reg.scope);
                    if (mounted) setRegistration(reg);
                    
                    const sub = await reg.pushManager.getSubscription();
                    if (sub) {
                        console.log('[Push] Found existing subscription:', sub.endpoint);
                        if (mounted) {
                            setSubscription(sub);
                            setIsSubscribed(true);
                        }
                    } else {
                        console.log('[Push] No existing subscription');
                        if (mounted) setIsSubscribed(false);
                    }
                } else {
                    console.log('[Push] No ServiceWorker registration found yet');
                }
            } catch (err) {
                console.error('[Push] Error during initialization:', err);
            } finally {
                if (mounted) setIsChecking(false);
            }
        }

        checkSubscription();

        // Safety timeout - never stay in loading more than 5 seconds
        const timer = setTimeout(() => {
            if (mounted && isChecking) {
                console.warn('[Push] Initialization timed out');
                setIsChecking(false);
            }
        }, 5000);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
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

            // Check if already subscribed
            let sub = await registration.pushManager.getSubscription();
            
            if (!sub) {
                // Create new subscription only if none exists
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });
                console.log('[Push] Created new subscription');
            } else {
                console.log('[Push] Reusing existing subscription');
            }

            setSubscription(sub);
            setIsSubscribed(true);

            // Send to backend (upsert handles duplicates)
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: sub,
                    userId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription to server');
            }

            console.log('[Push] Subscribed successfully');
        } catch (err: any) {
            console.error('[Push] Failed to subscribe:', err);
            setError(err.message);
            throw err; // Re-throw so caller can handle it
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!subscription) {
                console.warn('[Push] No subscription to unsubscribe from');
                return;
            }
            
            // Unsubscribe from browser
            const success = await subscription.unsubscribe();
            if (!success) {
                throw new Error('Failed to unsubscribe from push service');
            }
            
            // Notify backend to remove subscription
            const response = await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                }),
            });

            if (!response.ok) {
                console.warn('[Push] Failed to remove subscription from server, but local unsubscribe succeeded');
            }
            
            setSubscription(null);
            setIsSubscribed(false);
            console.log('[Push] Unsubscribed successfully');
        } catch (err: any) {
            console.error('[Push] Failed to unsubscribe:', err);
            setError(err.message);
            throw err; // Re-throw so caller can handle it
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, subscription, subscribe, unsubscribe, loading, error, isChecking };
}
