'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useAppStore } from '@/stores/authStore';

export function Page({ children, title, header, back = true }: PropsWithChildren<{
  title?: string;
  header?: React.ReactNode;
  back?: boolean | (() => void);
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { safeAreaInsets, cssVars, isTelegram, isDesktop } = useSafeArea();
  const { goToPreviousStep } = useAppStore();

  const onBack = useCallback(() => {
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
  }, [back, router, goToPreviousStep]);

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
  }, [onBack]);

  const outerClass = isDesktop ? 'w-full h-full flex justify-center items-center' : 'w-full h-full flex justify-center items-start';
  const innerClass = isDesktop
    // If we're on desktop, check if we want full width (custom prop? or layout). 
    // For now, let's keep default behavior but allow override via props if we added them.
    // Actually, let's just make it full width if it's NOT a modal-like page.
    // But Page is used everywhere.
    // Let's modify Page to accept a prop 'isDesktopFullWidth'.
    ? 'w-[414px] max-w-full bg-white rounded-2xl shadow-xl overflow-y-auto'
    : 'w-full h-full';

  const isWidePage = pathname?.includes('/cart') || pathname?.includes('/favorites') || pathname?.includes('/my-devices') || pathname?.includes('/buyback') || pathname?.includes('/repair') || pathname?.startsWith('/request');
  const isAdminPath = pathname?.startsWith('/admin');

  const finalOuterClass = isDesktop
    ? 'w-full min-h-screen flex flex-col bg-gray-50/50'
    : 'w-full min-h-full flex flex-col';

  const finalInnerClass = isDesktop
    ? (isWidePage || isAdminPath)
      ? 'w-full flex flex-col items-center flex-1'
      : 'w-full flex-1 flex items-center justify-center p-4'
    : 'w-full min-h-full flex flex-col';

  const desktopContentClass = (isWidePage || isAdminPath)
    ? 'w-full max-w-7xl mx-auto'
    : 'w-[414px] max-w-full bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]';

  return (
    <div className={finalOuterClass}>
      {header}
      <div className={finalInnerClass}>
        <div className={isDesktop ? desktopContentClass : 'w-full h-full'}>
          {children}
        </div>
      </div>
    </div>
  );
}