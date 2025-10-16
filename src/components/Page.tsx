'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore } from '@/stores/authStore';

export function Page({ children, back = true }: PropsWithChildren<{
  back?: boolean | (() => void);
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { safeAreaInsets, cssVars, isTelegram, isDesktop } = useSafeArea();
  const { goToPreviousStep } = useAppStore();

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
          // Если нет currentStep, просто возвращаемся назад
          router.back();
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

  const outerClass = isDesktop ? 'w-full h-full flex justify-center items-center' : 'w-full h-full flex justify-center items-start';
  const innerClass = isDesktop ? 'w-[414px] h-[896px] max-w-full max-h-full bg-white rounded-2xl shadow-xl overflow-hidden' : 'w-full h-full';

  return (
    <div className={outerClass}>
      <div className={innerClass}>
        {children}
      </div>
    </div>
  );
}