import React from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen min-w-screen bg-gray-900 flex flex-col flex-1" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
      {children}
    </div>
  );
};

export default AdminLayout;