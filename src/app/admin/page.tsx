'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { crashOptions } from '@/core/lib/constants'
import { RepairRequest } from '@/core/lib/interfaces'
import { useEffect, useState } from 'react'

const AdminPage = () => {
  const [bids, setBids] = useState([])

  useEffect(() => {
    const getBids = async () => {
      const res = await fetch('/api/bids')
      const data = await res.json()
      setBids(data)
    }
    getBids()
  }, [])

  const assignRepairman = (telegramId: string) => {
    return async () => {
      const res = await fetch('/api/repair/assign', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId }),
      })

      if (res.ok) {
        const updatedBids = await fetch('/api/bids').then(res => res.json())
        setBids(updatedBids)
      } else {
        console.error('Не удалось обновить статус')
      }
    }
  }

  return (
    <section>
      <h2>Админка</h2>
      <Table>
        <TableHeader>
          <TableRow className='bg-slate-500'>
            <TableHead>Btn</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Crashes</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid: RepairRequest) => (
            <TableRow key={bid.id}>
              <Button onClick={assignRepairman(bid.telegramId as string)}>
                Assign
              </Button>
              <TableCell>
                {
                  bid.brandModelText ? (
                    `${bid.brandModelText}`
                  ) : (
                    `${bid.brandname} ${bid.modelname}`
                  )
                }
              </TableCell>
              <TableCell>
                {(Array.isArray(bid.crash) ? bid.crash : [bid.crash])
                  .map((value) => {
                    const found = crashOptions.find((option) => option.value === value);
                    return found ? found.label : value;
                  })
                  .join(', ')}
              </TableCell>
              <TableCell>{bid.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

export default AdminPage