'use client'

import { Page } from '@/components/Page'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { SkupkaRequest } from '@/core/lib/interfaces'
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
        <Page back={true}>
            <div className="flex flex-col items-center justify-start w-full h-full p-4">
                <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">Таблица заявок</h2>
                <Table className="!border !border-black">
                    <TableHeader>
                        <TableRow className="!border !border-black">
                            <TableHead className='font-bold text-center text-black !text-extrabold text-xl'>Model</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((bid: SkupkaRequest) => (
                            <TableRow key={bid.id} onClick={() => router.push(`/admin/requests/${bid.id}`)}>
                                <TableCell className='text-center text-black !text-bold'>
                                    {bid.modelname}
                                </TableCell>
                                {/* <TableCell className='text-center'>
                                    {bid.condition}
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Page>
    )
}

export default RequestsPage