'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';

export function TelegramInit() {
  useEffect(() => {
    // Initialize store from WebApp data or session
    useAppStore.getState().initializeTelegram();

    if (!window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;

    const html = document.documentElement;
    const platform = tg.platform;

    // Очищаем старые классы перед добавлением новых
    html.classList.remove('telegram-desktop', 'telegram-mobile', 'telegram-fullscreen');

    if (platform === 'android' || platform === 'ios') {
      html.classList.add('telegram-mobile');
    } else {
      html.classList.add('telegram-desktop');
    }
  }, []);

  return null;
}