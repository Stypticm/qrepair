'use client';

import { useEffect } from 'react';

export function TelegramInit() {
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;
    tg.ready();

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