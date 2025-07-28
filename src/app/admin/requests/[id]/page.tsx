'use client'

import { useEffect, useState } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { crashOptions } from '@/core/lib/constants'
import { RepairRequest } from '@/core/lib/interfaces'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const RequestById = () => {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const [application, setApplication] = useState<RepairRequest | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getApplication = async () => {
            if (!id) {
                setError('ID заявки не указан');
                return;
            }

            try {
                const res = await fetch(`/api/requestById/${id}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Ошибка при загрузке заявки');
                }
                const data = await res.json();
                console.log(data);
                setApplication(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Не удалось загрузить заявку: ' + String(err));
            }
        };

        if (id) getApplication();
    }, [id]);

    const handleTakeRequest = async () => {
        try {
            const res = await fetch(`/api/takeRequest/${id}`, { method: 'PATCH' });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Ошибка при принятии заявки');
            }
            const data = await res.json();
            setApplication(data.application);
            setError(null);
        } catch (err) {
            console.error('Error taking request:', err);
            setError('Не удалось принять заявку: ' + String(err));
        }
    };

    const handleRequestDone = async () => {
        try {
            const res = await fetch(`/api/doneRequest/${id}`, { method: 'PATCH' });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Ошибка при завершении заявки');
            }
            const data = await res.json();
            setApplication(data.application);
            setError(null);
        } catch (err) {
            console.error('Error completing request:', err);
            setError('Не удалось завершить заявку: ' + String(err));
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-2">
            <Card className="mt-10 bg-slate-400">
                <CardHeader>
                    <CardTitle>Заявка {id}</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto flex flex-col">
                    <CardDescription>
                        <p className="text-slate-50">Телефон: {application?.brandname && application.modelname ? `${application.brandname} ${application.modelname}` : application?.brandModelText}</p>
                        <p className="text-slate-50">
                            Проблема: {(Array.isArray(application?.crash) ? application.crash : [application?.crash])
                                .map((value) => {
                                    const found = crashOptions.find((option) => option.value === value);
                                    return found ? found.label : value;
                                })
                                .join(', ')}
                        </p>
                        <p className="text-slate-50">
                            Статус:{' '}
                            <Badge className='bg-emerald-300'>
                                {application?.status === 'draft'
                                    ? 'Черновик'
                                    : application?.status === 'submitted'
                                        ? 'Ожидает обработки'
                                        : application?.status === 'in_progress'
                                            ? 'В обработке'
                                            : application?.status === 'done'
                                                ? 'Выполнена'
                                                : 'Завершена'}
                            </Badge>
                        </p>
                    </CardDescription>
                    <CardAction className="self-center pt-2">
                        {
                            application?.status === 'submitted' && <Button onClick={handleTakeRequest}>Принять заявку</Button>
                        }
                        {
                            application?.status === 'in_progress' && <Button onClick={handleRequestDone}>Выполнена</Button>
                        }
                    </CardAction>
                </CardContent>
            </Card>
            <section className='flex flex-col gap-2 p-4'>
                <Button>
                    <Link href='/admin/requests'>
                        Все заявки
                    </Link>
                </Button>
            </section>
        </div>
    )
}

export default RequestById
