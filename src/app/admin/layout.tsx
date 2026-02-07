'use client';

import React from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useSafeArea();

  return (
    <div className={`min-h-full min-w-screen flex flex-col flex-1 ${isDesktop ? 'bg-transparent' : 'bg-gray-900'}`} style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
      {children}
    </div>
  );
};

export default AdminLayout;