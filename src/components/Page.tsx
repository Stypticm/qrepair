'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean;
}>) {
  const router = useRouter();
  const { safeAreaInsets, cssVars } = useSafeArea();

  useEffect(() => {
    if (back) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [back]);

  useEffect(() => {
    const handleBackClick = () => {
      router.back();
    };

    backButton.onClick(handleBackClick);

    // Очистка подписки
    return () => {
      backButton.offClick(handleBackClick);
    };
  }, [router]);

  return (
    <section
      className="w-full h-full flex flex-col items-stretch justify-start"
      style={{
        ...cssVars as React.CSSProperties,
        paddingTop: `${safeAreaInsets.top}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
        paddingRight: `${safeAreaInsets.right}px`,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </section>
  );
}