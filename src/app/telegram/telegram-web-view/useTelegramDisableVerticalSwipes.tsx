import { useEffect } from "react";

const tg = (window as any).Telegram?.WebApp;

/**
 * Отключает свайп-вниз (vertical swipes) в Telegram Mini App,
 * чтобы пользователь закрывал приложение только через кнопку "Закрыть".
 *
 * Работает только в Telegram-клиентах, где доступен метод disableVerticalSwipes.
 */
export function useTelegramDisableVerticalSwipes() {
  useEffect(() => {
    if (!tg || typeof tg.disableVerticalSwipes !== "function") return;

    try {
      tg.disableVerticalSwipes();
    } catch {
      // игнорируем, если клиент не поддерживает
    }

    return () => {
      if (typeof tg.enableVerticalSwipes === "function") {
        try {
          tg.enableVerticalSwipes();
        } catch {
          // игнорируем ошибки при размонтировании
        }
      }
    };
  }, []);
}


