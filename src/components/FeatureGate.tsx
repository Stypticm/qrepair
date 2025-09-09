import React from 'react';
import { useFeatureFlags, type FeatureFlag } from '@/lib/featureFlags';

interface FeatureGateProps {
  feature: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  telegramId?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null,
  telegramId 
}) => {
  const { hasFeature } = useFeatureFlags();
  
  // Если передан telegramId, используем его, иначе берем из store
  const shouldShow = telegramId ? hasFeature(feature, telegramId) : hasFeature(feature);
  
  return shouldShow ? <>{children}</> : <>{fallback}</>;
};

// Хук для проверки флага
export const useFeature = (feature: FeatureFlag, telegramId?: string) => {
  const { hasFeature } = useFeatureFlags();
  return telegramId ? hasFeature(feature, telegramId) : hasFeature(feature);
};
