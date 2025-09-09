'use client'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen min-w-screen flex flex-col" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
      {/* Основной контент */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
