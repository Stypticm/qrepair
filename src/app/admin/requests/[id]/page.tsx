'use client'

import { useEffect, useState } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkupkaRequest } from '@/core/lib/interfaces'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { acceptRequest, courierReceived, fetchApplication, markPaid, reviewRequest } from '@/core/lib/requestActions';
import Image from 'next/image'

const RequestById = () => {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const [application, setApplication] = useState<SkupkaRequest | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [priceInput, setPriceInput] = useState<string>('')
    const [showPhotos, setShowPhotos] = useState<boolean>(false)

    useEffect(() => {
        const getApplication = async () => {
            if (!id) {
                setError('ID заявки не указан');
                return;
            }

            try {
                const data = await fetchApplication(id);
                setApplication(data);
                if (data?.price != null) setPriceInput(String(data.price))
                setError(null);
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Не удалось загрузить заявку: ' + String(err));
            }
        };

        if (id) getApplication();

        // live polling for status updates (priceConfirmed, status)
        const interval = setInterval(() => {
            getApplication();
        }, 4000);
        return () => clearInterval(interval);
    }, [id]);

    const handleAcceptRequest = async () => {
        try {
            const maybePrice = priceInput.trim() === '' ? undefined : Number(priceInput)
            const data = await acceptRequest(
                id as string,
                Number.isFinite(maybePrice as number)
                    ? (maybePrice as number)
                    : undefined
            );
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error accepting request:', err);
            setError(String(err));
        }
    };

    const handleReviewRequest = async () => {
        try {
            const maybePrice = priceInput.trim() === '' ? undefined : Number(priceInput)
            const data = await reviewRequest(id as string, Number.isFinite(maybePrice as number) ? (maybePrice as number) : undefined);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error reviewing request:', err);
            setError(String(err));
        }
    };

    const handleCourierReceived = async () => {
        try {
            const data = await courierReceived(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error marking courier received:', err);
            setError(String(err));
        }
    };

    const handleMarkPaid = async () => {
        try {
            const data = await markPaid(id as string);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error marking paid:', err);
            setError(String(err));
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
                        <p className="text-slate-50">Модель телефона: {application?.modelname}</p>
                        <p className="text-slate-50">Предварительная цена: {application?.price ?? '—'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {(() => {
                                // Цена редактируется только до отправки пользователю окончательной цены
                                // Разрешено ТОЛЬКО на этапе accepted; после отправки (in_progress и далее) — нельзя
                                const isEditable = application?.status === 'accepted'
                                return (
                                    <input
                                        className={`rounded px-2 py-1 text-black ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        type="number"
                                        placeholder="Итоговая цена"
                                        value={priceInput}
                                        onChange={(e) => setPriceInput(e.target.value)}
                                        disabled={!isEditable}
                                    />
                                )
                            })()}
                            <Button variant="secondary" onClick={() => setShowPhotos((v) => !v)}>
                                {showPhotos ? 'Скрыть фото' : 'Посмотреть фото'}
                            </Button>
                        </div>
                        {application?.status !== 'accepted' && (
                            <p className="text-slate-50 text-sm mt-1">Цена уже отправлена клиенту и недоступна для изменения.</p>
                        )}
                        {showPhotos && application?.photoUrls && application.photoUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {application.photoUrls.map((url, idx) => (
                                    <Image
                                        key={idx}
                                        src={url}
                                        alt={`Фото ${idx + 1}`} className="w-full h-24 object-cover rounded"
                                        width={100}
                                        height={100}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="text-slate-50 flex flex-col gap-1">
                            <span>
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
                                                            : application?.status === 'completed' && 'Выполнена'
                                    }
                                </Badge>
                            </span>
                            {(application?.status === 'in_progress' || application?.status === 'on_the_way') && (
                                <span>
                                    Ответ пользователя:{' '}
                                    <Badge className={application?.priceConfirmed ? 'bg-green-600' : 'bg-red-600'}>
                                        {application?.priceConfirmed ? 'Цена подтверждена' : 'Цена не подтверждена'}
                                    </Badge>
                                </span>
                            )}
                        </p>
                    </CardDescription>
                    <CardAction className="self-center pt-2 gap-2">
                        {application?.status === 'accepted' && <Button onClick={handleAcceptRequest}>Принять заявку</Button>}
                        {application?.status === 'in_progress' && (
                            <Button onClick={handleReviewRequest} disabled={!application?.price || !(application as any)?.priceConfirmed}>
                                Заявка рассмотрена
                            </Button>
                        )}
                        {application?.status === 'on_the_way' && <Button onClick={handleCourierReceived}>Телефон у курьера</Button>}
                        {application?.status === 'paid' && <Button onClick={handleMarkPaid}>Оплачено</Button>}
                        {
                            application?.status === 'completed' &&
                            <section className="text-black !border-3 rounded-md !border-slate-700 p-2">
                                Заявка выполнена
                            </section>
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
