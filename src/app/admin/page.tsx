'use client'

import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AdminPage = () => {
  return (
    <Page back={true}>
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className='text-4xl font-semibold text-gray-900 text-center mb-4 tracking-tight'>
                🛠️ Админ панель
              </h1>
              <p className="text-lg text-gray-600">Управление системой выкупа устройств</p>
            </div>
            
            <section className='flex flex-col gap-4 w-full'>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white h-16 text-lg font-semibold shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl">
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