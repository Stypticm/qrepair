'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';

export function useOrderNotifications() {
    const [count, setCount] = useState(0);
    const telegramId = useAppStore(state => state.telegramId);

    const [isUnauthorized, setIsUnauthorized] = useState(false);

    const fetchOrders = async () => {
        if (!telegramId || isUnauthorized) {
            setCount(0);
            return;
        }

        try {
            const response = await fetch('/api/orders/my');
            
            if (response.status === 401) {
                // Если не авторизован, запоминаем это и больше не опрашиваем
                setIsUnauthorized(true);
                setCount(0);
                return;
            }

            if (response.ok) {
                const data = await response.json();
                const orders = data.orders || [];
                
                // Считаем заказы, которые находятся в "активной" фазе обработки
                const activeOrders = orders.filter((o: any) => 
                    o.status === 'confirmed' || o.status === 'in_delivery'
                );
                
                setCount(activeOrders.length);
                setIsUnauthorized(false);
            }
        } catch (error) {
            // Игнорируем сетевые ошибки
        }
    };

    useEffect(() => {
        setIsUnauthorized(false); // Сбрасываем при смене пользователя
        fetchOrders();

        // Обновляем раз в 30 секунд, только если нет ошибки авторизации
        const interval = setInterval(() => {
            if (!isUnauthorized) fetchOrders();
        }, 30000);

        const handleFocus = () => {
            if (isUnauthorized) setIsUnauthorized(false); // Пробуем снова при фокусе
            fetchOrders();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [telegramId]);

    return { count };
}
