'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';

export function TelegramInit() {
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;
    tg.ready();

    // Initialize store from WebApp data
    useAppStore.getState().initializeTelegram();

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