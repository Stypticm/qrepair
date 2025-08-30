'use client';

import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';

const RequestsPage = () => {
    const [applications, setApplications] = useState<SkupkaRequest[]>([]);
    const router = useRouter();

    useEffect(() => {
        const getBids = async () => {
            const res = await fetch('/api/applications');
            const data = await res.json();
            setApplications(data);
        };
        getBids();
    }, []);

    return (
        <AdaptiveContainer>
            <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-white to-gray-50">
                <div className="flex-1 w-full p-6">
                    <div className="max-w-7xl mx-auto w-full">
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

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-semibold text-gray-900 mb-2">📋 Заявки</h2>
                            <p className="text-gray-600">Управление заявками на выкуп устройств</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                            {applications.length === 0 ? (
                                <Card className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-gray-900 font-semibold text-lg">Нет заявок</p>
                                        <p className="text-gray-600 mt-2">Заявки появятся здесь</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                applications.map((bid: SkupkaRequest) => (
                                    <Card
                                        key={bid.id}
                                        className="w-full bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
                                        onClick={() => router.push(`/admin/requests/${bid.id}`)}
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-gray-900">Заявка {bid.id}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Модель:</p>
                                                    <p className="text-gray-900 font-medium">{bid.modelname || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Статус:</p>
                                                    <Badge
                                                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${bid.status === 'draft'
                                                            ? 'bg-gray-500'
                                                            : bid.status === 'accepted'
                                                                ? 'bg-green-500'
                                                                : bid.status === 'in_progress'
                                                                    ? 'bg-yellow-500'
                                                                    : bid.status === 'on_the_way'
                                                                        ? 'bg-[#2dc2c6]'
                                                                        : bid.status === 'paid'
                                                                            ? 'bg-emerald-500'
                                                                            : 'bg-gray-600'
                                                            }`}
                                                    >
                                                        {bid.status === 'draft'
                                                            ? 'Черновик'
                                                            : bid.status === 'accepted'
                                                                ? 'Принята'
                                                                : bid.status === 'in_progress'
                                                                    ? 'На проверке'
                                                                    : bid.status === 'on_the_way'
                                                                        ? 'В пути'
                                                                        : bid.status === 'paid'
                                                                            ? 'Оплачено'
                                                                            : 'Выполнена'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Мастер:</p>
                                                    <p className="text-gray-900">
                                                        {bid.courierTimeSlot ? `Назначено ${bid.courierTimeSlot}` : 'Не назначен'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdaptiveContainer>
    );
};

export default RequestsPage;