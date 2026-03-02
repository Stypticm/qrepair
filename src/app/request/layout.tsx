'use client'

import { TradeInProgress } from '@/components/features/trade-in/TradeInProgress'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f5f7]">
      <TradeInProgress />
      {/* Основной контент */}
      <div className="flex-1 items-center justify-center pb-8">
        <div className="w-full max-w-[480px] mx-auto box-border h-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
