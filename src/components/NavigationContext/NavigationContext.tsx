'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationContextType {
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  clearCurrentStep: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const router = useRouter();

  // Восстанавливаем текущий шаг из sessionStorage при загрузке
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('currentStep');
      if (savedStep) {
        setCurrentStep(savedStep);
      }
    }
  }, []);

  // Сохраняем текущий шаг в sessionStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined' && currentStep) {
      sessionStorage.setItem('currentStep', currentStep);
    }
  }, [currentStep]);

  // Определяем порядок шагов
  const stepOrder = [
    'device-info',
    'form',
    'evaluation',
    'device-functions',
    'delivery-options',
    'pickup-points',
    'courier-booking',
    'photos',
    'final'
  ];

  const goToPreviousStep = () => {
    if (!currentStep) return;
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setCurrentStep(previousStep);
      
      // Очищаем данные доставки при возврате к выбору способа доставки
      if (previousStep === 'delivery-options' && typeof window !== 'undefined') {
        sessionStorage.removeItem('pickupPointsData');
        sessionStorage.removeItem('courierBookingData');
      }
      
      // Перенаправляем на предыдущий шаг
      switch (previousStep) {
        case 'device-info':
          router.push('/request/device-info');
          break;
        case 'form':
          router.push('/request/form');
          break;
        case 'evaluation':
          router.push('/request/evaluation');
          break;
        case 'device-functions':
          router.push('/request/device-functions');
          break;
        case 'delivery-options':
          router.push('/request/delivery-options');
          break;
        case 'pickup-points':
          router.push('/request/pickup-points');
          break;
        case 'courier-booking':
          router.push('/request/courier-booking');
          break;
        case 'photos':
          router.push('/request/photos');
          break;
        case 'final':
          router.push('/request/final');
          break;
        default:
          router.push('/request/device-info');
      }
    } else {
      // Если это первый шаг, возвращаемся на главную
      router.push('/');
    }
  };

  const goToNextStep = () => {
    if (!currentStep) return;
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // Перенаправляем на следующий шаг
      switch (nextStep) {
        case 'device-info':
          router.push('/request/device-info');
          break;
        case 'form':
          router.push('/request/form');
          break;
        case 'evaluation':
          router.push('/request/evaluation');
          break;
        case 'device-functions':
          router.push('/request/device-functions');
          break;
        case 'delivery-options':
          router.push('/request/delivery-options');
          break;
        case 'pickup-points':
          router.push('/request/pickup-points');
          break;
        case 'courier-booking':
          router.push('/request/courier-booking');
          break;
        case 'photos':
          router.push('/request/photos');
          break;
        case 'final':
          router.push('/request/final');
          break;
        default:
          router.push('/request/device-info');
      }
    }
  };

  const canGoBack = currentStep ? stepOrder.indexOf(currentStep) > 0 : false;
  const canGoForward = currentStep ? stepOrder.indexOf(currentStep) < stepOrder.length - 1 : false;

  // Функция для очистки текущего шага
  const clearCurrentStep = () => {
    setCurrentStep(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentStep');
    }
  };

  return (
    <NavigationContext.Provider value={{
      currentStep,
      setCurrentStep,
      goToPreviousStep,
      goToNextStep,
      canGoBack,
      canGoForward,
      clearCurrentStep
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
