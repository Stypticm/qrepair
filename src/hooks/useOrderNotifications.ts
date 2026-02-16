'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';

export function useOrderNotifications() {
    const [count, setCount] = useState(0);
    const telegramId = useAppStore(state => state.telegramId);

    const fetchOrders = async () => {
        if (!telegramId) {
            setCount(0);
            return;
        }

        try {
            const response = await fetch('/api/orders/my');
            if (response.ok) {
                const data = await response.json();
                const orders = data.orders || [];
                
                // Считаем заказы, которые находятся в "активной" фазе обработки
                // (подтвержден или в доставке) - то, что точно интересно клиенту
                const activeOrders = orders.filter((o: any) => 
                    o.status === 'confirmed' || o.status === 'in_delivery'
                );
                
                setCount(activeOrders.length);
            }
        } catch (error) {
            console.error('Failed to fetch order notifications:', error);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Обновляем раз в 30 секунд
        const interval = setInterval(fetchOrders, 30000);

        // Также обновляем при фокусе окна
        const handleFocus = () => fetchOrders();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [telegramId]);

    return { count };
}
