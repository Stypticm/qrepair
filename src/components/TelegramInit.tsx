'use client'

import { useEffect } from "react";

export function TelegramInit() {
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready?.();
            tg.expand?.(); // опционально
        }
    }, [])

    return null;
}