'use client';

import React from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useSafeArea();

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isDesktop ? 'bg-[#f8f9fa]' : 'bg-gray-900'}`}>
      <AdminSidebar />
      <div className="flex-1 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;