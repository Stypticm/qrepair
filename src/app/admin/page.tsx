'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/Link/Link';
import { Page } from '@/components/Page';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  return (
    <AdaptiveContainer>
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-white to-gray-50">
        <div className="flex-1 w-full p-6">
          <div className="w-full max-w-2xl mx-auto">
            {/* Кнопка "Назад" */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-xl transition-all duration-200"
              >
                ← Назад
              </Button>
            </div>

            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Панель администратора</h1>
              <p className='text-gray-600'>Управление системой QRepair</p>
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
    </AdaptiveContainer>
  )
}

export default AdminPage