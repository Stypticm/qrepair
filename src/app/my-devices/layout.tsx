import React from 'react';

const StatusLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen min-w-screen flex flex-col flex-1" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
            {children}
        </div>
    );
};

export default StatusLayout;