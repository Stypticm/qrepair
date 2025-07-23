'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { crashOptions } from '@/core/lib/constants'
import { RepairRequest } from '@/core/lib/interfaces'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const RequestsPage = () => {
    const [applications, setApplications] = useState([])
    const router = useRouter()

    useEffect(() => {
        const getBids = async () => {
            const res = await fetch('/api/applications')
            const data = await res.json()
            setApplications(data)
        }
        getBids()
    }, [])

    return (
        <>
            <h1 className='text-center'>Таблица заявок</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className='font-bold text-center text-slate-100'>Model</TableHead>
                        <TableHead className='font-bold text-center text-slate-100'>Crashes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((bid: RepairRequest) => (
                        <TableRow key={bid.id} onClick={() => router.push(`/admin/requests/${bid.id}`)}>
                            <TableCell className='text-center'>
                                {
                                    bid.brandModelText ? (
                                        `${bid.brandModelText}`
                                    ) : (
                                        `${bid.brandname} ${bid.modelname}`
                                    )
                                }
                            </TableCell>
                            <TableCell className='text-center'>
                                {(Array.isArray(bid.crash) ? bid.crash : [bid.crash])
                                    .map((value) => {
                                        const found = crashOptions.find((option) => option.value === value);
                                        return found ? found.label : value;
                                    })
                                    .join(', ')}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default RequestsPage