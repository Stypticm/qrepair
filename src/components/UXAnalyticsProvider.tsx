'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUXAnalytics } from '@/hooks/useUXAnalytics';

interface UXAnalyticsContextType {
  trackPageView: (page: string) => void;
  trackButtonClick: (buttonName: string, page: string) => void;
  trackFormSubmit: (formName: string, success: boolean, data?: any) => void;
  trackError: (error: string, page: string) => void;
  trackDropOff: (page: string) => void;
}

const UXAnalyticsContext = createContext<UXAnalyticsContextType | null>(null);

export function UXAnalyticsProvider({ children }: { children: ReactNode }) {
  const analytics = useUXAnalytics();

  // Автоматически отслеживаем просмотры страниц
  useEffect(() => {
    const currentPage = window.location.pathname;
    analytics.trackPageView(currentPage);

    // Отслеживаем изменения маршрута
    const handleRouteChange = () => {
      analytics.trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [analytics]);

  return (
    <UXAnalyticsContext.Provider value={analytics}>
      {children}
    </UXAnalyticsContext.Provider>
  );
}

export function useUXAnalyticsContext() {
  const context = useContext(UXAnalyticsContext);
  if (!context) {
    throw new Error('useUXAnalyticsContext must be used within UXAnalyticsProvider');
  }
  return context;
}
