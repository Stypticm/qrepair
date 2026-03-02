'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Smartphone, MapPin, Truck } from 'lucide-react'
import { useAppStore } from '@/stores/authStore'
import { toast } from 'sonner'

export default function AdminRepairPage() {
    const router = useRouter()
    const { telegramId } = useAppStore()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [telegramId])

    const fetchRequests = async () => {
        try {
            const id = telegramId || sessionStorage.getItem('telegramId')
            if (!id) return

            const res = await fetch('/api/repair/list', {
                headers: { 'x-telegram-id': id.toString() }
            })

            if (res.ok) {
                const data = await res.json()
                setRequests(data.requests)
            } else {
                toast.error('Ошибка загрузки заявок')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const tid = telegramId || sessionStorage.getItem('telegramId')
            const res = await fetch(`/api/repair/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': tid?.toString() || ''
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success('Статус обновлен')
                fetchRequests() // Refresh list
            } else {
                toast.error('Не удалось обновить статус')
            }
        } catch (e) {
            console.error(e)
            toast.error('Ошибка сети')
        }
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            created: { label: 'Новая', color: 'bg-blue-100 text-blue-800' },
            courier_assigned: { label: 'Курьер назначен', color: 'bg-indigo-100 text-indigo-800' },
            in_transit: { label: 'В пути в СЦ', color: 'bg-indigo-100 text-indigo-800' },
            received: { label: 'В СЦ', color: 'bg-purple-100 text-purple-800' },
            diagnosing: { label: 'Диагностика', color: 'bg-amber-100 text-amber-800' },
            price_approval: { label: 'Согласование цены', color: 'bg-orange-100 text-orange-800' },
            repairing: { label: 'В ремонте', color: 'bg-yellow-100 text-yellow-800' },
            ready_for_pickup: { label: 'Готово к выдаче', color: 'bg-green-100 text-green-800' },
            delivered: { label: 'Выдано', color: 'bg-gray-100 text-gray-800' },
            cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-800' }
        }
        const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
        return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${mapped.color}`}>{mapped.label}</span>
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-24 pb-12 overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-6 w-full">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        className="w-10 h-10 p-0 rounded-full hover:bg-gray-200"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Заявки на ремонт</h1>
                    <Button
                        variant="outline"
                        className="ml-auto flex items-center gap-2"
                        onClick={fetchRequests}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Заявок пока нет</h3>
                        <p className="text-gray-500 mt-1">Новые заявки появятся здесь.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map(req => (
                            <Card key={req.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <CardTitle className="text-xl font-bold">{req.deviceModel}</CardTitle>
                                                {getStatusBadge(req.status)}
                                            </div>
                                            <p className="text-sm text-gray-500 font-mono">#{req.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">{req.category}</div>
                                            <div className="text-xs text-gray-500 mt-1">Создана: {new Date(req.createdAt).toLocaleString('ru')}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {req.issueDescription && (
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Описание</div>
                                                    <p className="text-sm text-gray-700">{req.issueDescription}</p>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Логистика</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {req.deliveryMethod === 'courier' ? (
                                                        <>
                                                            <Truck className="w-4 h-4 text-orange-500" />
                                                            <span>Курьерская: {req.appointmentDate && new Date(req.appointmentDate).toLocaleDateString('ru')} в {req.appointmentTime}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-4 h-4 text-blue-500" />
                                                            <span>Привезет клиент (самовывоз)</span>
                                                        </>
                                                    )}
                                                </div>
                                                {req.courierNotes && (
                                                    <div className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded">
                                                        <b>Адрес курьера:</b> {req.courierNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Действия / Смена статуса</div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'received')}>В СЦ</Button>
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'diagnosing')}>Диагностика</Button>
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'price_approval')}>Согласование</Button>
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'repairing')}>В ремонте</Button>
                                                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => updateStatus(req.id, 'ready_for_pickup')}>Готово к выдаче</Button>
                                                    <Button size="sm" variant="outline" className="text-gray-500" onClick={() => updateStatus(req.id, 'delivered')}>Завершить (Выдано)</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
