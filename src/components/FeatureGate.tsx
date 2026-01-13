import React from 'react';
import { type FeatureFlag } from '@/lib/featureFlags';
import { useFeatureFlags } from '@/stores/authStore';

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
  const shouldShow = hasFeature(feature);
  
  return shouldShow ? <>{children}</> : <>{fallback}</>;
};

// Хук для проверки флага
export const useFeature = (feature: FeatureFlag) => {
  const { hasFeature } = useFeatureFlags();
  return hasFeature(feature);
};
