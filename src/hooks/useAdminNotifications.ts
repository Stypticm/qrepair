'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';

export function useAdminNotifications() {
    const [count, setCount] = useState(0);
    const telegramId = useAppStore(state => state.telegramId);

    useEffect(() => {
        if (!telegramId || !isAdminTelegramId(telegramId)) {
            setCount(0);
            return;
        }

        const fetchCount = async () => {
            try {
                // We use headers for auth as in other API calls
                const tg = (window as any).Telegram?.WebApp;
                const initData = tg?.initData || '';

                const response = await fetch('/api/admin/notifications/count', {
                    headers: {
                        'x-telegram-init-data': initData,
                        'x-telegram-id': telegramId || ''
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCount(data.count || 0);
                }
            } catch (error) {
                console.error('Failed to fetch admin notifications:', error);
            }
        };

        fetchCount();
        
        // Refresh every 15 seconds
        const interval = setInterval(fetchCount, 15000);

        // Also refresh when window gets focus
        const handleFocus = () => fetchCount();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [telegramId]);

    return { count };
}
