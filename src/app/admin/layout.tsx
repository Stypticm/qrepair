'use client';

import React from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useSafeArea();

  return (
    <div className={`flex-1 w-full flex flex-col ${isDesktop ? 'bg-transparent' : 'bg-gray-900'}`}>
      {children}
    </div>
  );
};

export default AdminLayout;