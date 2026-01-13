import React from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'top' | 'bottom' | 'left' | 'right' | 'all' | 'none';
  style?: React.CSSProperties;
}

export function SafeAreaWrapper({ 
  children, 
  className = '', 
  padding = 'all',
  style = {} 
}: SafeAreaWrapperProps) {
  const { safeAreaInsets } = useSafeArea();

  const getPaddingStyle = () => {
    switch (padding) {
      case 'top':
        return { paddingTop: `calc(env(safe-area-inset-top) + ${safeAreaInsets.top}px)` };
      case 'bottom':
        return { paddingBottom: `calc(env(safe-area-inset-bottom) + ${safeAreaInsets.bottom}px)` };
      case 'left':
        return { paddingLeft: `calc(env(safe-area-inset-left) + ${safeAreaInsets.left}px)` };
      case 'right':
        return { paddingRight: `calc(env(safe-area-inset-right) + ${safeAreaInsets.right}px)` };
      case 'all':
        return {
          paddingTop: `calc(env(safe-area-inset-top) + ${safeAreaInsets.top}px)`,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${safeAreaInsets.bottom}px)`,
          paddingLeft: `calc(env(safe-area-inset-left) + ${safeAreaInsets.left}px)`,
          paddingRight: `calc(env(safe-area-inset-right) + ${safeAreaInsets.right}px)`,
        };
      case 'none':
        return {};
      default:
        return {};
    }
  };

  return (
    <div 
      className={className}
      style={{
        ...getPaddingStyle(),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
