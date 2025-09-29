'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore } from '@/stores/authStore';

export function Page({ children, back = true }: PropsWithChildren<{
  back?: boolean | (() => void);
}>) {
  const router = useRouter();
  const { safeAreaInsets, cssVars, isTelegram, isDesktop } = useSafeArea();
  const { goToPreviousStep } = useAppStore();

  console.log('Page safeAreaInsets:', safeAreaInsets);

  useEffect(() => {
    try {
      if (back) {
        backButton.show();
      } else {
        backButton.hide();
      }
    } catch (error) {
      console.log('Error managing back button:', error);
    }
  }, [back]);

  useEffect(() => {
    const handleBackClick = () => {
      if (typeof back === 'function') {
        // Если передана кастомная функция, вызываем её
        back();
      } else {
        // Проверяем, есть ли currentStep в store
        const { currentStep } = useAppStore.getState();
        console.log('🔍 Page handleBackClick - currentStep:', currentStep);
        
        if (!currentStep) {
          // Если нет currentStep, идем на главную
          router.push('/');
        } else {
          // Используем логику из стора для навигации
          goToPreviousStep(router);
        }
      }
    };

    try {
      backButton.onClick(handleBackClick);
    } catch (error) {
      console.log('Error binding back button:', error);
    }

    return () => {
      try {
        backButton.offClick(handleBackClick);
      } catch (error) {
        console.log('Error unbinding back button:', error);
      }
    };
  }, [router, goToPreviousStep, back]);

  return (
    <section
      className="w-full h-dvh bg-white text-black"
      style={{
        ...cssVars as React.CSSProperties,
        paddingTop: isTelegram ? `${safeAreaInsets.top}px` : '0px',
        paddingBottom: isTelegram ? `${safeAreaInsets.bottom}px` : '0px',
        paddingLeft: isTelegram ? `${safeAreaInsets.left}px` : '0px',
        paddingRight: isTelegram ? `${safeAreaInsets.right}px` : '0px',
        boxSizing: 'border-box',
      }}
    >
      <div className="w-full h-full flex justify-center items-start">
        <div
          className={`w-full max-w-md ${isDesktop && isTelegram ? 'md:w-[390px] h-[844px]' : 'h-full'} mx-auto bg-white ${isDesktop && isTelegram ? 'rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.10)]' : ''} px-4 box-border overflow-y-auto`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}