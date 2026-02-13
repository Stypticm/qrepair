'use client';

import { useState, useEffect } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { useAppStore } from '@/stores/authStore';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const PushNotificationToggle = () => {
    const { isSubscribed, subscribe, unsubscribe, loading, error, isChecking } = useWebPush();
    const telegramId = useAppStore(state => state.telegramId);

    const handleSubscribe = async () => {
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !process.env.NEXT_PUBLIC_VAPID_PUBLIC) {
            toast.error('VAPID ключи не настроены. Уведомления не будут работать локально.');
            return;
        }

        await subscribe(telegramId?.toString());
        if (!error) {
            toast.success('Уведомления включены!');
        } else {
            toast.error('Ошибка включения уведомлений');
        }
    };

    const handleUnsubscribe = async () => {
        await unsubscribe();
        if (!error) {
            toast.success('Уведомления выключены');
        } else {
            toast.error('Ошибка выключения уведомлений');
        }
    };

    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (PWA)
        const checkPWA = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');
            setIsPWA(!!isStandalone);
        };

        checkPWA();
        window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
    }, []);

    // Only show in PWA
    if (!isPWA) return null;

    if (loading || isChecking) {
        return (
            <button disabled className="p-2 rounded-xl bg-gray-100 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    if (isSubscribed) {
        return (
            <button
                onClick={handleUnsubscribe}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all shadow-sm active:scale-95"
                title="Отключить уведомления"
            >
                <Bell className="w-5 h-5" />
                <span className="text-sm font-medium">Уведомления включены</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleSubscribe}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
            <BellOff className="w-5 h-5" />
            <span className="text-sm font-medium">Включить уведомления</span>
        </button>
    );
};
