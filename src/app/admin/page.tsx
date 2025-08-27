'use client'

import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AdminPage = () => {
  return (
    <Page back={true}>
      <div className="p-6 w-full my-auto">
        <section className='flex flex-col items-center justify-center'>
          <h1 className='text-4xl font-bold text-white text-center mb-12'>Админ панель</h1>
          <section className='flex flex-col gap-6 w-full max-w-md'>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-16 text-xl font-semibold shadow-lg">
              <Link href='/admin/masters' className="w-full h-full flex items-center justify-center">
                👨‍🔧 Управление мастерами
              </Link>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white h-16 text-xl font-semibold shadow-lg">
              <Link href='/admin/requests' className="w-full h-full flex items-center justify-center">
                📋 Управление заявками
              </Link>
            </Button>
            {/* <Button className="bg-purple-600 hover:bg-purple-700 text-white h-16 text-xl font-semibold shadow-lg">
                    <Link href='/admin/repairman' className="w-full h-full flex items-center justify-center">
                    🔧 Ремонтники
                    </Link>
                    </Button> */}
            <Button className="bg-orange-600 hover:bg-orange-700 text-white h-16 text-xl font-semibold shadow-lg">
              <Link href='/admin/telegram-id' className="w-full h-full flex items-center justify-center">
                🔍 Найти Telegram ID
              </Link>
            </Button>
          </section>
        </section>
      </div>
    </Page>
  )
}

export default AdminPage