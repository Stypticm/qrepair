'use client';

import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/Page';

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
        <Page back={true}>
            <div className="flex flex-col h-full w-full">
                <div className="flex-1 p-6 w-full">
                    <div className="max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Заявки</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                            {applications.length === 0 ? (
                                <Card className="w-full bg-gray-800 border-gray-700">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-white font-bold text-lg">Нет заявок</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                applications.map((bid: SkupkaRequest) => (
                                    <Card
                                        key={bid.id}
                                        className="w-full bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
                                        onClick={() => router.push(`/admin/requests/${bid.id}`)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-white">Заявка {bid.id}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-gray-300 space-y-2">
                                                <p>Модель: {bid.modelname || '—'}</p>
                                                <p>
                                                    Статус:{' '}
                                                    <Badge
                                                        className={`px-2 py-1 rounded text-white ${bid.status === 'draft'
                                                            ? 'bg-gray-500'
                                                            : bid.status === 'accepted'
                                                                ? 'bg-green-500'
                                                                : bid.status === 'in_progress'
                                                                    ? 'bg-yellow-500'
                                                                    : bid.status === 'on_the_way'
                                                                        ? 'bg-blue-500'
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
                                                </p>
                                                <p>
                                                    Мастер:{' '}
                                                    {bid.courierTimeSlot ? `Назначено ${bid.courierTimeSlot}` : 'Не назначен'}
                                                </p>
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default RequestsPage;