'use client';

import { useChatContext } from '@/hooks/useChatContext';

interface ChatContextProps {
  className?: string;
}

export function ChatContext({ className = '' }: ChatContextProps) {
  const { isChatContext } = useChatContext();

  if (!isChatContext) {
    return null;
  }

  return (
    <div className={`fixed top-0 right-0 bg-[#2dc2c6] text-white text-xs p-2 z-50 rounded-bl ${className}`}>
      <div>Chat Context</div>
      <div>Force Expand</div>
    </div>
  );
}
