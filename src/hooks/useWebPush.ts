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
            console.log('[Push] Subscribe called, userId:', userId);
            console.log('[Push] VAPID key present:', !!PUBLIC_VAPID_KEY);

            // Wait for Service Worker to be ready if not already registered
            let reg = registration;
            if (!reg) {
                console.log('[Push] Waiting for Service Worker to be ready...');
                if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
                    throw new Error('Service Worker not supported');
                }
                
                // Add timeout to prevent infinite waiting
                const timeout = new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Service Worker registration timeout')), 10000)
                );
                
                reg = await Promise.race([
                    navigator.serviceWorker.ready,
                    timeout
                ]) as ServiceWorkerRegistration;
                
                setRegistration(reg);
                console.log('[Push] Service Worker is now ready:', reg.scope);
            }

            if (!PUBLIC_VAPID_KEY) {
                console.error('[Push] VAPID key is missing!');
                throw new Error('Public VAPID Key not found');
            }

            // Check if already subscribed
            console.log('[Push] Checking for existing subscription...');
            let sub = await reg.pushManager.getSubscription();
            
            if (!sub) {
                // Create new subscription only if none exists
                console.log('[Push] Creating new subscription...');
                sub = await reg.pushManager.subscribe({
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
            console.log('[Push] Sending subscription to backend...');
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: sub,
                    telegramId: userId
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Push] Server error:', errorText);
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
