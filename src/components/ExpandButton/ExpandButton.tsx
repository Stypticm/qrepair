'use client';

import { Button } from '@/components/ui/button';
import { useSafeArea } from '@/hooks/useSafeArea';
import { cn } from '@/lib/utils';

interface ExpandButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function ExpandButton({ className = '', children = 'Развернуть' }: ExpandButtonProps) {
  const { isTelegram, forceFullscreen, isFullscreen } = useSafeArea();

  // Скрываем кнопку, если не в Telegram или уже в полноэкранном режиме
  if (!isTelegram || isFullscreen) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        forceFullscreen();
      }}
      className={cn('bg-[#2dc2c6] hover:bg-[#25a8ac] text-white', className)}
      size="sm"
    >
      {children}
    </Button>
  );
}