'use client';

import { useEffect, useState } from 'react';
// Убрали импорт SDK методов для свайпов - используем прямой доступ к Telegram WebApp API
import Image from 'next/image';
import { useSafeArea } from '@/hooks/useSafeArea';
import { usePathname } from 'next/navigation';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  fixedContent?: React.ReactNode;
  className?: string;
}

export function AdaptiveContainer({ children, fixedContent, className = '' }: AdaptiveContainerProps) {
  const safeArea = useSafeArea();
  const { isTelegram, isReady, safeAreaInsets, isFullscreen } = safeArea;
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const desktop = !mobile && (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux'));

      safeArea.getState()?.setIsMobile(mobile);
      safeArea.getState()?.setIsDesktop(desktop);
    };

    checkDevice();
  }, [isMounted, safeArea]);

  // Управление свайпами в зависимости от платформы
  useEffect(() => {
    if (!isMounted) return;
    if (!safeArea.isTelegram) return;
    // Важно: управление свайпами централизовано в `useTelegramDisableVerticalSwipes()`.
    // Дублирующие enable/disable + ретраи на мобильных часто вызывают дерганье скролла/viewport.
    return;
  }, [isMounted, safeArea.isTelegram]);

  if (!isMounted) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <Image
          src="/animation_running.gif"
          alt="Загрузка"
          width={192}
          height={192}
          className="object-contain rounded-2xl"
        />
      </div>
    );
  }

  const getContainerStyles = () => {
    const { isMobile, isDesktop } = safeArea;
    if (!isTelegram) {
      if (isDesktop) {
        if (isAdminPath) {
          return {
            container: 'min-h-dvh w-full flex flex-col bg-gray-50',
            main: 'w-full flex-1 overflow-x-hidden overflow-y-auto relative',
            wrapper: 'w-full flex-1 relative',
            fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
          };
        }
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'w-[390px] h-[844px] overflow-x-hidden overflow-y-auto relative',
          wrapper: 'w-[390px] h-[844px] mx-auto relative',
          fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
        };
      } else if (isMobile) {
        return {
          container: 'min-h-dvh w-full flex flex-col bg-white items-center justify-center',
          main: 'flex-1 h-full w-full max-w-md mx-auto bg-white overflow-y-auto overflow-x-hidden relative',
          wrapper: 'w-full h-full max-w-md mx-auto relative flex flex-col',
          fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
        };
      }
    }

    if (isDesktop) {
      return {
        // В Telegram Desktop заполняем весь webview, без внутренних рамок и фоновых полей
        container: 'w-full h-full flex flex-col items-stretch justify-stretch bg-transparent',
        main: 'w-full h-full overflow-y-auto relative', // Разрешаем скролл
        wrapper: 'w-full h-full relative',
        fixedLayer: 'absolute inset-0 pointer-events-none z-[10000]'
      };
    } else {
      // Проверяем платформу для мобильных устройств
      const isTGWorkerMobile = typeof window !== 'undefined' &&
        (window as any).Telegram?.WebApp?.platform &&
        ['android', 'ios'].includes((window as any).Telegram?.WebApp?.platform);

      return {
        container: `min-h-dvh w-full flex flex-col bg-white ${isTGWorkerMobile ? 'telegram-fullscreen' : ''}`,
        main: 'flex-1 w-full overflow-y-auto overflow-x-hidden suppress-overscroll relative', // Добавили класс для подавления оверскролла
        wrapper: 'w-full h-full flex flex-col relative',
        fixedLayer: 'fixed inset-0 pointer-events-none z-[10000]'
      };
    }
  };

  const styles = getContainerStyles();

  if (isTelegram && !isReady) {
    return (
      <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-white">
        <Image
          src="/animation_running.gif"
          alt="Загрузка"
          width={192}
          height={192}
          className="object-contain rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-[#2dc2c6] text-white text-xs p-2 z-50 rounded-br">
          <div>Mode: {isTelegram ? 'Telegram' : 'Browser'}</div>
          <div>Device: {safeArea.isMobile ? 'Mobile' : safeArea.isDesktop ? 'Desktop' : 'Unknown'}</div>
          <div>Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</div>
        </div>
      )} */}

      <div className={styles.wrapper}>
        <div className={styles.main}>
          {children}
        </div>

        {fixedContent && (
          <div className={styles.fixedLayer}>
            {fixedContent}
          </div>
        )}
      </div>
    </div>
  );
}