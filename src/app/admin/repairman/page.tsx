'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Page } from '@/components/Page'

interface Master {
    id: string
    telegramId: string
    username: string
    name: string
    isActive: boolean
    createdAt: string
}

const RepairManPage = () => {
    const [masters, setMasters] = useState<Master[]>([])
    const [loading, setLoading] = useState(true)

    // Загрузка мастеров
    const loadMasters = async () => {
        try {
            const response = await fetch('/api/admin/masters')
            if (response.ok) {
                const data = await response.json()
                setMasters(data.masters)
            }
        } catch (error) {
            console.error('Error loading masters:', error)
            toast.error('Ошибка загрузки мастеров')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMasters()
    }, [])

    // Удаление мастера
    const deleteMaster = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этого мастера?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/masters/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Мастер удалён')
                loadMasters()
            } else {
                toast.error('Ошибка удаления мастера')
            }
        } catch (error) {
            console.error('Error deleting master:', error)
            toast.error('Ошибка удаления мастера')
        }
    }

    // Активация/деактивация мастера
    const toggleMasterStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/masters/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            })

            if (response.ok) {
                toast.success(`Мастер ${!currentStatus ? 'активирован' : 'деактивирован'}`)
                loadMasters()
            } else {
                toast.error('Ошибка изменения статуса')
            }
        } catch (error) {
            console.error('Error toggling master status:', error)
            toast.error('Ошибка изменения статуса')
        }
    }

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar admin-masters-scroll">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className='text-3xl font-semibold text-gray-900 mb-2'>👨‍🔧 Список мастеров</h1>
                                <p className="text-gray-600">Управление мастерами системы</p>
                            </div>
                            <Button 
                                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-xl transition-all duration-200"
                                onClick={() => window.location.href = '/admin/masters'}
                            >
                                + Добавить мастера
                            </Button>
                        </div>
                    
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="text-gray-600">Загрузка мастеров...</div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                                            <TableHead className='font-semibold text-center text-gray-900'>Действия</TableHead>
                                            <TableHead className='font-semibold text-center text-gray-900'>Имя</TableHead>
                                            <TableHead className='font-semibold text-center text-gray-900'>Username</TableHead>
                                            <TableHead className='font-semibold text-center text-gray-900'>Telegram ID</TableHead>
                                            <TableHead className='font-semibold text-center text-gray-900'>Статус</TableHead>
                                            <TableHead className='font-semibold text-center text-gray-900'>Дата добавления</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {masters.map((master) => (
                                            <TableRow key={master.id} className="hover:bg-gray-50 border-gray-200">
                                                <TableCell className='flex gap-2 justify-center'>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => toggleMasterStatus(master.id, master.isActive)}
                                                        className="text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg"
                                                    >
                                                        {master.isActive ? 'Деактивировать' : 'Активировать'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deleteMaster(master.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                    >
                                                        Удалить
                                                    </Button>
                                                </TableCell>
                                                <TableCell className='text-center text-gray-900'>{master.name || master.username}</TableCell>
                                                <TableCell className='text-center text-gray-900 font-mono'>@{master.username}</TableCell>
                                                <TableCell className='text-center text-gray-900 font-mono'>{master.telegramId}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Badge 
                                                        variant={master.isActive ? "default" : "secondary"}
                                                        className={master.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                                                    >
                                                        {master.isActive ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='text-center text-gray-900'>
                                                    {new Date(master.createdAt).toLocaleDateString('ru-RU')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                {masters.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-gray-900 text-lg">Мастера не найдены</div>
                                        <div className="text-gray-600 mt-2">Добавьте первого мастера, чтобы начать работу</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    )
}

export default RepairManPage