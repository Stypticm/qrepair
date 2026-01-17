import { useEffect, useRef } from "react";

const tg = (window as any).Telegram?.WebApp;

/**
 * Управляет режимом окна Telegram Mini App:
 * - На мобильных устройствах: fullscreen
 * - На десктопе: компактный режим (не вызываем expand())
 * 
 * Ключевой момент: ready() уже вызван в index.html, здесь только управляем размером окна
 */
export function useTelegramWindowMode() {
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!tg || initializedRef.current) return;
        initializedRef.current = true;

        const isMobile = tg.platform === "android" || tg.platform === "ios";
        const isDesktop = !isMobile && (
            tg.platform === "tdesktop" || 
            tg.platform === "macos" || 
            tg.platform === "web" || 
            tg.platform === "weba"
        );

        // Для мобильных устройств - fullscreen
        if (isMobile) {
            const expandWindow = () => {
                if (tg.isVersionAtLeast?.("8.0") && tg.requestFullscreen) {
                    tg.requestFullscreen();
                } else {
                    tg.expand?.();
                }
            };

            // Вызываем сразу и с задержками для надежности
            expandWindow();
            [120, 300, 700].forEach(ms => setTimeout(expandWindow, ms));
            
            // Следим за изменениями viewport
            tg.onEvent?.("viewportChanged", expandWindow);

            return () => tg.offEvent?.("viewportChanged", expandWindow);
        }

        // Для десктопа - НЕ вызываем expand() или requestFullscreen()
        // Это единственный способ сохранить компактный режим
        // ready() уже вызван в index.html, что помогает предотвратить автоматическое разворачивание
        if (isDesktop) {
            // На десктопе просто не делаем ничего - оставляем компактный режим
            // Если окно уже развернуто, мы не можем его свернуть программно
        }
    }, []);
}

