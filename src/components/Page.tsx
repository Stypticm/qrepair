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

  useEffect(() => {
    try {
      if (back) {
        backButton.show();
      } else {
        backButton.hide();
      }
    } catch (error) {
      // Игнорируем ошибки, если приложение не запущено в Telegram
      console.log('BackButton show/hide error (ignored):', error);
    }
  }, [back]);

  useEffect(() => {
    const handleBackClick = () => {
      // Используем навигацию по шагам вместо router.back()
      if (canGoBack) {
        goToPreviousStep();
      } else {
        // Если не можем идти назад по шагам, используем обычную навигацию
        router.back();
      }
    };

    try {
      backButton.onClick(handleBackClick);
    } catch (error) {
      // Игнорируем ошибки, если приложение не запущено в Telegram
      console.log('BackButton setup error (ignored):', error);
    }

    // Очистка подписки
    return () => {
      try {
        backButton.offClick(handleBackClick);
      } catch (error) {
        // Игнорируем ошибки при очистке, если приложение не запущено в Telegram
        console.log('BackButton cleanup error (ignored):', error);
      }
    };
  }, [router, goToPreviousStep, canGoBack]);

  return (
    <section
      className="w-full h-full flex flex-col items-stretch justify-start bg-[#2dc2c6] text-black"
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
      {children}
    </section>
  );
}