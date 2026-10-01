import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SCROLL_TOLERANCE = 4;

function isPageScrollable() {
  const doc = document.documentElement;
  return (
    doc.scrollHeight - doc.clientHeight > SCROLL_TOLERANCE ||
    document.body.scrollHeight - window.innerHeight > SCROLL_TOLERANCE
  );
}

/**
 * Telegram-специфика: `disableVerticalSwipes()` блокирует не только свайп-закрытие,
 * но и вертикальный скролл WebView. Поэтому отключаем свайпы только на страницах,
 * которые не прокручиваются, а на прокручиваемых оставляем нативный скролл.
 */
export function useTelegramDisableVerticalSwipes() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const platform = tg.platform;
    if (platform !== "ios" && platform !== "android") return;

    const apply = () => {
      try {
        if (isPageScrollable()) {
          if (typeof tg.enableVerticalSwipes === "function") {
            tg.enableVerticalSwipes();
          }
        } else if (typeof tg.disableVerticalSwipes === "function") {
          tg.disableVerticalSwipes();
        }
      } catch {
        // игнорируем, если клиент не поддерживает
      }
    };

    apply();
    const frame = requestAnimationFrame(apply);
    const timer = window.setTimeout(apply, 400);
    window.addEventListener("resize", apply);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", apply);
      if (typeof tg?.enableVerticalSwipes === "function") {
        try {
          tg.enableVerticalSwipes();
        } catch {
          // игнорируем ошибки при размонтировании
        }
      }
    };
  }, [pathname]);
}
