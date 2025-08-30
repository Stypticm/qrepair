'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/Link/Link';
import { Page } from '@/components/Page';

const AdminPage = () => {
  return (
    <Page back={true}>
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar admin-masters-scroll" style={{ height: 'calc(100vh - 120px)', overflowY: 'scroll', paddingTop: 'env(--safe-area-top, 60px)' }}>
          <div className="w-full max-w-2xl mx-auto">
                         <div className='text-center mb-8 mt-12'>
               <h1 className='text-3xl font-bold text-gray-900 mb-2'>Панель администратора</h1>
               <p className='text-gray-600'>Управление системой QoS</p>
             </div>
            
            <section className='flex flex-col gap-4 w-full'>
              <Button className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white h-16 text-lg font-semibold shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl">
                <Link href='/admin/masters' className="w-full h-full flex items-center justify-center">
                  👨‍🔧 Управление мастерами
                </Link>
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white h-16 text-lg font-semibold shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl">
                <Link href='/admin/requests' className="w-full h-full flex items-center justify-center">
                  📋 Управление заявками
                </Link>
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white h-16 text-lg font-semibold shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl">
                <Link href='/admin/telegram-id' className="w-full h-full flex items-center justify-center">
                  🔍 Найти Telegram ID
                </Link>
              </Button>
            </section>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default AdminPage