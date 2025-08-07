'use client'

import { useEffect, useState } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConditionStatus, SkupkaRequest } from '@/core/lib/interfaces'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { checkRequest, completeRequest, payRequest, takeRequest } from '@/core/lib/requestActions'

const RequestById = () => {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const [application, setApplication] = useState<SkupkaRequest | null>(null)
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
            const data = await takeRequest(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error taking request:', err);
            setError(String(err));
        }
    };

    const handleCompleteRequest = async () => {
        try {
            const data = await completeRequest(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error completing request:', err);
            setError(String(err));
        }
    };

    const handleCheckRequest = async () => {
        try {
            const data = await checkRequest(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error checking request:', err);
            setError(String(err));
        }
    };

    const handlePayRequest = async () => {
        try {
            const data = await payRequest(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error paying request:', err);
            setError(String(err));
        }
    };

    const formatCondition = (condition: ConditionStatus[] | string | undefined) => {
        if (!condition) return 'Состояние: Не указано';
        const condArray = Array.isArray(condition) ? condition : [condition]; // Преобразуем строку в массив, если нужно

        const displayDamaged = condArray.includes('display_with_damage');
        const bodyDamaged = condArray.includes('body_with_damage');
        const displayWhole = condArray.includes('display') && !displayDamaged;
        const bodyWhole = condArray.includes('body') && !bodyDamaged;

        const displayText = `Дисплей битый, но работает - ${displayDamaged ? 'Да' : 'Нет'}`;
        const bodyText = `Корпус целый - ${bodyWhole ? 'Да' : 'Нет'}`;

        return `Состояние: ${displayText}, ${bodyText}`;
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-2">
            <Card className="mt-10 bg-slate-400">
                <CardHeader>
                    <CardTitle>Заявка {id}</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto flex flex-col">
                    <CardDescription>
                        <p className="text-slate-50">Модель телефона: {application?.modelname}`</p>
                        <p className="text-slate-50">{formatCondition(application?.condition)}</p>
                        <p className="text-slate-50">
                            Статус:{' '}
                            <Badge className='bg-emerald-300'>
                                {
                                    application?.status === 'draft'
                                        ? 'Черновик'
                                        : application?.status === 'accepted'
                                            ? 'Принята'
                                            : application?.status === 'in_progress'
                                                ? 'На проверке'
                                                : application?.status === 'on_the_way'
                                                    ? 'В пути'
                                                    : application?.status === 'paid'
                                                        ? 'Оплачено'
                                                        : 'Выполнена'
                                }
                            </Badge>
                        </p>
                    </CardDescription>
                    <CardAction className="self-center pt-2 gap-2">
                        {application?.status === 'accepted' && <Button onClick={handleTakeRequest}>Принять заявку</Button>}
                        {application?.status === 'in_progress' && <Button onClick={handleCompleteRequest}>Выполнена</Button>}
                        {application?.status === 'on_the_way' && <Button onClick={handleCheckRequest}>Заявка проверена</Button>}
                        {application?.status === 'paid' && <Button onClick={handlePayRequest}>Оплачено</Button>}
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
