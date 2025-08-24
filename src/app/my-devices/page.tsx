'use client'

import { Page } from '@/components/Page'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


const MyDevices = () => {
  const { telegramId } = useStartForm();
  const router = useRouter();
  const [myDevices, setMyDevices] = useState<SkupkaRequest[]>([]);

  useEffect(() => {
    if (telegramId) {
      const getData = async () => {
        try {
          const res = await fetch(`/api/my-devices?telegramId=${telegramId}`)
          const data = await res.json()
          setMyDevices(data)
        } catch (e) {
          console.error(e)
        }
      }
      getData()
    }
  }, [telegramId])

  return (
    <Page back={true}>
      <div className="flex flex-col items-center justify-start w-full h-full p-4">
        <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">📋 МОИ УСТРОЙСТВА</h2>
        <Table className="!border !border-black">
          <TableHeader>
            <TableRow className="!border !border-black">
              <TableHead className='font-bold text-center text-black !text-extrabold text-xl'>Model</TableHead>
              <TableHead className='font-bold text-center text-black !text-extrabold text-xl'>Status</TableHead>
              <TableHead className='font-bold text-center text-black !text-extrabold text-xl'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              myDevices.map((bid: SkupkaRequest) => (
                <TableRow key={bid.id}>
                  <TableCell className='text-center text-black !text-bold'>{bid.modelname}</TableCell>
                  <TableCell className='text-center text-black !text-bold'>
                    <Button
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                      onClick={() => router.push(`/my-devices/status?status=${bid.status}`)}>
                      Check status
                    </Button>
                  </TableCell>
                  <TableCell className='text-center text-black !text-bold'>
                    {bid.status === 'on_the_way' && bid.courierUserConfirmed && !bid.inspectionCompleted && (
                      <Button
                        size="sm"
                        className="bg-gray-800 hover:bg-gray-700 text-white"
                        onClick={() => router.push(`/my-devices/inspection?id=${bid.id}`)}>
                        🔍 Проверить устройство
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </Page>
  )
}

export default MyDevices