'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationContextType {
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const router = useRouter();

  // Определяем порядок шагов
  const stepOrder = [
    'device-info',
    'form',
    'condition', 
    'additional-condition',
    'submit'
  ];

  const goToPreviousStep = () => {
    if (!currentStep) return;
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setCurrentStep(previousStep);
      
      // Перенаправляем на предыдущий шаг
      switch (previousStep) {
        case 'device-info':
          router.push('/request/device-info');
          break;
        case 'form':
          router.push('/request/form');
          break;
        case 'condition':
          router.push('/request/condition');
          break;
        case 'additional-condition':
          router.push('/request/additional-condition');
          break;
        case 'submit':
          router.push('/request/submit');
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
        case 'condition':
          router.push('/request/condition');
          break;
        case 'additional-condition':
          router.push('/request/additional-condition');
          break;
        case 'submit':
          router.push('/request/submit');
          break;
        default:
          router.push('/request/device-info');
      }
    }
  };

  const canGoBack = currentStep ? stepOrder.indexOf(currentStep) > 0 : false;
  const canGoForward = currentStep ? stepOrder.indexOf(currentStep) < stepOrder.length - 1 : false;

  return (
    <NavigationContext.Provider value={{
      currentStep,
      setCurrentStep,
      goToPreviousStep,
      goToNextStep,
      canGoBack,
      canGoForward
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
