'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AdminPage = () => {
  return (
    <>
      <h1 className='text-2xl font-bold text-center'>Админка</h1>
      <section className='flex flex-col gap-2 p-4'>
        <Button>
          <Link href='/admin/repairman'>
            Мастера
          </Link>
        </Button>
        <Button>
          <Link href='/admin/requests'>
            Заявки
          </Link>
        </Button>
      </section>
    </>
  )
}

export default AdminPage