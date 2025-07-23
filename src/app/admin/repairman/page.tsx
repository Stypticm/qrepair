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

const repairmanlist = [
    {
        id: 1,
        name: 'John Doe',
    },
    {
        id: 2,
        name: 'Karl Smith',
    },
    {
        id: 3,
        name: 'Samuel Jackson',
    }
]

const RepairManPage = () => {
    return (
        <>
            <h1 className='text-2xl font-bold text-center'>Список мастеров</h1>
            <section className='flex flex-col p-4'>
                <Button>Добавить мастера</Button>
            </section>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className='font-bold text-center text-slate-100'>Action</TableHead>
                        <TableHead className='font-bold text-center text-slate-100'>Name</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {repairmanlist.map((repairman) => (
                        <TableRow key={repairman.id}>
                            <TableCell className='flex gap-2 justify-center'>
                                <Button>Delete</Button>
                            </TableCell>
                            <TableCell className='text-center'>{repairman.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default RepairManPage