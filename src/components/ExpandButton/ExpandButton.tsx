'use client';

import { Button } from '@/components/ui/button';
import { useSafeArea } from '@/hooks/useSafeArea';

interface ExpandButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function ExpandButton({ className = '', children = 'Развернуть' }: ExpandButtonProps) {
  const { isTelegram, forceExpand } = useSafeArea();

  if (!isTelegram) {
    return null;
  }

  return (
    <Button
      onClick={forceExpand}
      className={`bg-blue-500 hover:bg-blue-600 text-white ${className}`}
      size="sm"
    >
      {children}
    </Button>
  );
}
