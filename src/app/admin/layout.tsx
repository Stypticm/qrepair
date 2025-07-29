import React from 'react'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='h-screen'>
            {children}
        </div>
    )
}

export default AdminLayout