'use client';

import React from 'react';
import { useSafeArea } from '@/hooks/useSafeArea';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useSafeArea();

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isDesktop ? 'bg-[#f8f9fa]' : 'bg-white'}`}>
      <AdminSidebar />
      <div className="flex-1 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;