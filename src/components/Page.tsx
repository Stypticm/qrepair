'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore } from '@/stores/authStore';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean;
}>) {
  const router = useRouter();
  const { safeAreaInsets, cssVars } = useSafeArea();
  const { goToPreviousStep, currentStep } = useAppStore();
  const canGoBack = currentStep !== null;
  
  // Отладочная информация

  useEffect(() => {
    try {
      if (back) {
        backButton.show();
      } else {
        backButton.hide();
      }
    } catch (error) {
      // Игнорируем ошибки, если приложение не запущено в Telegram
    }
  }, [back]);

  useEffect(() => {
    const handleBackClick = () => {
      // Используем навигацию по шагам вместо router.back()
      if (canGoBack) {
        goToPreviousStep(router);
      } else {
        // Если не можем идти назад по шагам, используем обычную навигацию
        // Для страниц без навигации по шагам (например, "Мои устройства") всегда идем на главную
        router.push('/');
      }
    };

    try {
      backButton.onClick(handleBackClick);
    } catch (error) {
      // Игнорируем ошибки, если приложение не запущено в Telegram
    }

    // Очистка подписки
    return () => {
      try {
        backButton.offClick(handleBackClick);
      } catch (error) {
        // Игнорируем ошибки при очистке, если приложение не запущено в Telegram
      }
    };
  }, [router, goToPreviousStep, canGoBack]);

  return (
    <section
      className="w-full min-h-screen flex flex-col items-stretch justify-start bg-white text-black"
      style={{
        ...cssVars as React.CSSProperties,
        paddingTop: `${safeAreaInsets.top}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
        paddingRight: `${safeAreaInsets.right}px`,
        height: '90vh',
        boxSizing: 'border-box'
      }}
    >
      <div className="w-full flex-1 flex justify-center">
        <div className="w-full max-w-md md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </section>
  );
}