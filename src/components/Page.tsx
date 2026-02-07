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
  const innerClass = isDesktop
    // If we're on desktop, check if we want full width (custom prop? or layout). 
    // For now, let's keep default behavior but allow override via props if we added them.
    // Actually, let's just make it full width if it's NOT a modal-like page.
    // But Page is used everywhere.
    // Let's modify Page to accept a prop 'isDesktopFullWidth'.
    ? 'w-[414px] max-w-full bg-white rounded-2xl shadow-xl overflow-y-auto'
    : 'w-full h-full';

  const isWidePage = pathname?.includes('/cart') || pathname?.includes('/favorites') || pathname?.includes('/buyback') || pathname?.includes('/repair');
  const isAdminPath = pathname?.startsWith('/admin');

  const desktopClass = isAdminPath
    ? 'w-full bg-transparent shadow-none overflow-visible'
    : isWidePage
      ? 'w-full max-w-7xl mx-auto bg-transparent shadow-none overflow-visible'
      : 'w-[414px] max-w-full bg-white rounded-2xl shadow-xl overflow-y-auto';

  const finalInnerClass = isDesktop ? desktopClass : 'w-full h-full';

  const finalOuterClass = (isDesktop && !isWidePage && !isAdminPath)
    ? 'w-full h-full flex justify-center items-center bg-gray-100/50'
    : 'w-full h-full';

  return (
    <div className={finalOuterClass}>
      <div className={finalInnerClass}>{children}</div>
    </div>
  );
}