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

    // Устанавливаем цвет фона Telegram = тёмный,
    // чтобы при overscroll (iOS bounce) не было бирюзового/белого.
    // Вызываем ПОСЛЕ ready(), чтобы Telegram точно применил цвет.
    const BG_COLOR = '#030712';
    const applyColors = () => {
      try {
        if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor(BG_COLOR);
        if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor(BG_COLOR);
        if (typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor(BG_COLOR);
      } catch {
        // игнорируем, если метод не поддерживается клиентом
      }
    };

    // Применяем сразу и повторно после ready()
    applyColors();
    tg.ready();
    // После ready() Telegram может переопределить цвета — повторно применяем
    setTimeout(applyColors, 100);
  }, []);

  return null;
}