'use client';

import { useState } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const PushNotificationToggle = () => {
    const { isSubscribed, subscribe, loading, error } = useWebPush();

    const handleSubscribe = async () => {
        await subscribe();
        if (!error) {
            toast.success('Уведомления включены!');
        } else {
            toast.error('Ошибка включения уведомлений');
        }
    };

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
