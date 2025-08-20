'use client';

import { Page } from '@/components/Page';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
            <div className="flex flex-col items-center justify-start w-full h-full p-4">
                <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-4 text-center">Заявки</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {applications.length === 0 ? (
                        <Card className="w-full bg-gray-200">
                            <CardContent className="p-4 text-center">
                                <p className="text-black font-bold">Нет заявок</p>
                            </CardContent>
                        </Card>
                    ) : (
                        applications.map((bid: SkupkaRequest) => (
                            <Card
                                key={bid.id}
                                className="w-full bg-slate-400 cursor-pointer hover:bg-slate-500 transition-colors"
                                onClick={() => router.push(`/admin/requests/${bid.id}`)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-slate-50">Заявка {bid.id}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-50">
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
                                                                        : 'bg-gray-800'
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
        </Page>
    );
};

export default RequestsPage;