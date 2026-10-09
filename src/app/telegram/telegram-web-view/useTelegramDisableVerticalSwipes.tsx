import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Telegram Mini App: отключает свайп вниз для сворачивания/закрытия приложения в трей
 * во всем приложении глобально.
 * Закрытие доступно только по системной кнопке Telegram или крестику с подтверждением.
 */
export function useTelegramDisableVerticalSwipes() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const apply = () => {
      try {
        // Всегда блокируем свайп в трей/закрытие во всем приложении
        if (typeof tg.disableVerticalSwipes === "function") {
          tg.disableVerticalSwipes();
        }
        // Всегда запрашиваем подтверждение закрытия
        if (typeof tg.enableClosingConfirmation === "function") {
          tg.enableClosingConfirmation();
        }
        // Разворачиваем на весь экран
        if (typeof tg.expand === "function") {
          tg.expand();
        }
      } catch {
        // игнорируем ошибки, если клиент не поддерживает
      }
    };

    apply();
    const frame = requestAnimationFrame(apply);
    const timer1 = window.setTimeout(apply, 150);
    const timer2 = window.setTimeout(apply, 500);
    const timer3 = window.setTimeout(apply, 1200);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
    };
  }, [pathname]);
}
