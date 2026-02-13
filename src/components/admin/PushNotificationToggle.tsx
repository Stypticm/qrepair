'use client';

import { useState, useEffect } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { useAppStore } from '@/stores/authStore';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const PushNotificationToggle = () => {
    const { isSubscribed, subscribe, loading, error } = useWebPush();
    const telegramId = useAppStore(state => state.telegramId);

    const handleSubscribe = async () => {
        await subscribe(telegramId?.toString());
        if (!error) {
            toast.success('Уведомления включены!');
        } else {
            toast.error('Ошибка включения уведомлений');
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

    if (loading) {
        return (
            <button disabled className="p-2 rounded-xl bg-gray-100 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    if (isSubscribed) {
        return (
            <button
                className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Уведомления включены"
            >
                <Bell className="w-5 h-5" />
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
