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

  const onBack = () => {
    if (!back) return;
    if (typeof back === 'function') {
      back();
      return;
    }
    const { currentStep } = useAppStore.getState();
    if (!currentStep) {
      router.back();
    } else {
      goToPreviousStep(router);
    }
  };

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
    const handleBackClick = () => onBack();

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
        {/* Web back button fallback when Telegram BackButton is unavailable or not clickable */}
        {back ? (
          <button
            onClick={onBack}
            className="absolute top-3 left-3 z-50 h-10 w-10 rounded-full bg-white/90 border border-gray-200 shadow flex items-center justify-center active:scale-95"
            aria-label="Назад"
          >
            <span className="text-xl leading-none">←</span>
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}