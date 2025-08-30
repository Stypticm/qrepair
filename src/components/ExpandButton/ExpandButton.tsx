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
      className={`bg-[#2dc2c6] hover:bg-[#25a8ac] text-white ${className}`}
      size="sm"
    >
      {children}
    </Button>
  );
}
