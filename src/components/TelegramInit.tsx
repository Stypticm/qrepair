'use client';

import { useLayoutEffect } from 'react';

export function TelegramInit() {
    useLayoutEffect(() => {
        if (!window.Telegram?.WebApp) return;

        const tg = window.Telegram.WebApp;

        // 1️⃣ Расширяем ДО ready
        tg.expand?.();

        // 2️⃣ Сообщаем, что всё готово
        tg.ready?.();

        // 3️⃣ Классы для CSS
        const html = document.documentElement;

        if (tg.platform === 'android' || tg.platform === 'ios') {
            html.classList.add('telegram-mobile', 'telegram-fullscreen');
        } else {
            html.classList.add('telegram-desktop');
        }
    }, []);

    return null;
}
