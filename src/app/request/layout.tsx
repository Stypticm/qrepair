'use client'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen w-full flex flex-col" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
      {/* Основной контент */}
      <div className="flex-1 items-center justify-center">
        <div className="w-full max-w-[480px] box-border h-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
