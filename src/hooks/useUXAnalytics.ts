import { useEffect, useRef } from 'react';
import { UXAnalyticsAgent } from '@/agents/UXAnalyticsAgent';

export function useUXAnalytics() {
  const agentRef = useRef<UXAnalyticsAgent | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Инициализируем агент
    agentRef.current = new UXAnalyticsAgent();
    
    // Создаем уникальный ID сессии
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Отслеживаем начало сессии
    agentRef.current.trackSessionStart(sessionIdRef.current);

    // Отслеживаем время на странице
    const startTime = Date.now();
    
    return () => {
      // При размонтировании компонента отслеживаем время на странице
      if (agentRef.current && sessionIdRef.current) {
        const duration = Date.now() - startTime;
        const currentPage = window.location.pathname;
        agentRef.current.trackPageTime(sessionIdRef.current, currentPage, duration);
      }
    };
  }, []);

  const trackAction = (action: string, page: string, data?: any) => {
    if (agentRef.current && sessionIdRef.current) {
      agentRef.current.trackUserAction(sessionIdRef.current, action, page, data);
    }
  };

  const trackError = (error: string, page: string) => {
    if (agentRef.current && sessionIdRef.current) {
      agentRef.current.trackUserError(sessionIdRef.current, error, page);
    }
  };

  const trackPageView = (page: string) => {
    trackAction('page_view', page);
  };

  const trackFormSubmit = (formName: string, success: boolean, data?: any) => {
    trackAction('form_submit', window.location.pathname, {
      formName,
      success,
      data
    });
  };

  const trackButtonClick = (buttonName: string, page: string) => {
    trackAction('button_click', page, { buttonName });
  };

  const trackDropOff = (page: string) => {
    if (agentRef.current && sessionIdRef.current) {
      agentRef.current.trackSessionEnd(sessionIdRef.current, page);
    }
  };

  return {
    trackAction,
    trackError,
    trackPageView,
    trackFormSubmit,
    trackButtonClick,
    trackDropOff
  };
}
