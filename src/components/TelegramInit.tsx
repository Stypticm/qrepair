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

    if (platform === 'android' || platform === 'ios') {
      html.dataset.env = 'tg-mobile';
    } else {
      html.dataset.env = 'tg-desktop';
    }
  }, []);

  return null;
}