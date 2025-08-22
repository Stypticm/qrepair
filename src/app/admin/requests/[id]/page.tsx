'use client';

import { useEffect, useState } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { acceptRequest, courierReceived, fetchApplication, markPaid, reviewRequest } from '@/core/lib/requestActions';
import Image from 'next/image';

const RequestById = () => {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [application, setApplication] = useState<SkupkaRequest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [priceInput, setPriceInput] = useState<string>('');
    const [priceDirty, setPriceDirty] = useState<boolean>(false);
    const [showPhotos, setShowPhotos] = useState<boolean>(false);

    useEffect(() => {
        const getApplication = async () => {
            if (!id) {
                setError('ID заявки не указан');
                return;
            }
            try {
                const data = await fetchApplication(id);
                setApplication(data);
                if (!priceDirty && data?.price != null) setPriceInput(String(data.price));
                setError(null);
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Не удалось загрузить заявку: ' + String(err));
            }
        };

        if (id) getApplication();

        const interval = setInterval(() => {
            getApplication();
        }, 4000);
        return () => clearInterval(interval);
    }, [id, priceDirty]);

    const handleAcceptRequest = async () => {
        try {
            const maybePrice = priceInput.trim() === '' ? undefined : Number(priceInput);
            const data = await acceptRequest(id as string, Number.isFinite(maybePrice as number) ? maybePrice : undefined);
            setApplication(data);
            setPriceDirty(false);
            setError(null);
        } catch (err) {
            console.error('Error accepting request:', err);
            setError(String(err));
        }
    };

    const handleReviewRequest = async () => {
        try {
            const maybePrice = priceInput.trim() === '' ? undefined : Number(priceInput);
            const data = await reviewRequest(id as string, Number.isFinite(maybePrice as number) ? maybePrice : undefined);
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
        <div className="min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-2xl mx-auto bg-slate-400">
                <CardHeader>
                    <CardTitle>Заявка {id}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <CardDescription>
                        <p className="text-slate-50">Модель телефона: {application?.modelname}</p>
                        <p className="text-slate-50">Предварительная цена: {application?.price ?? '—'} ₽</p>
                        <div className="flex items-center gap-2 mt-2">
                            {(() => {
                                const isEditable = application?.status === 'accepted';
                                return (
                                    <input
                                        className={`rounded px-2 py-1 text-black ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        type="number"
                                        placeholder="Итоговая цена"
                                        value={priceInput}
                                        onChange={(e) => { setPriceDirty(true); setPriceInput(e.target.value); }}
                                        disabled={!isEditable}
                                    />
                                );
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
                                        alt={`Фото ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded"
                                        width={100}
                                        height={100}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="text-slate-50 flex flex-col gap-1">
                            <span>
                                Статус:{' '}
                                <Badge className="bg-emerald-300">
                                    {application?.status === 'draft'
                                        ? 'Черновик'
                                        : application?.status === 'accepted'
                                            ? 'Принята'
                                            : application?.status === 'in_progress'
                                                ? 'На проверке'
                                                : application?.status === 'on_the_way'
                                                    ? 'В пути'
                                                    : application?.status === 'paid'
                                                        ? 'Оплачено'
                                                        : application?.status === 'completed' && 'Выполнена'}
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
                    {(application as any)?.courierTelegramId && (
                        <div className="mt-3 p-3 rounded-md border border-slate-700 bg-white/30 text-black">
                            <p className="font-semibold">Детали выезда мастера</p>
                            <p>Мастер TG: {(application as any).courierTelegramId}</p>
                            {(application as any).courierTimeSlot && <p>Выбранное время: {(application as any).courierTimeSlot}</p>}
                            {(application as any).courierScheduledAt && (
                                <p>
                                    Назначено на:{' '}
                                    {(() => {
                                        try {
                                            const d = new Date((application as any).courierScheduledAt);
                                            return d.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
                                        } catch {
                                            return String((application as any).courierScheduledAt);
                                        }
                                    })()}
                                </p>
                            )}
                            <p>Подтверждение клиента: {(application as any).courierUserConfirmed ? 'Да' : 'Нет'}</p>
                        </div>
                    )}
                    <CardAction className="self-center pt-2 w-full">
                        <div className="flex flex-wrap justify-center gap-2 w-full">
                            {application?.status === 'accepted' && (
                                <Button className="min-w-[200px]" onClick={handleAcceptRequest}>
                                    Принять заявку
                                </Button>
                            )}
                            {application?.status === 'in_progress' && (
                                <Button
                                    className="min-w-[200px]"
                                    onClick={handleReviewRequest}
                                    disabled={!application?.price || !(application as any)?.priceConfirmed}
                                >
                                    Цена подтверждена
                                </Button>
                            )}
                            {application && (
                                <Button
                                    className="min-w-[200px]"
                                    variant="outline"
                                    disabled={Boolean((application as any)?.courierTelegramId)}
                                    onClick={async () => {
                                        if ((application as any)?.courierTelegramId) return;
                                        const masterId = prompt('Введите telegramId мастера:');
                                        if (!masterId) return;
                                        const res = await fetch(`/api/courier/schedule/${application.id}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ courierTelegramId: masterId }),
                                        });
                                        const data = await res.json();
                                        if (!res.ok) alert(data?.error || 'Ошибка назначения мастера');
                                        else {
                                            alert('Мастер назначен. Пользователю отправлен выбор времени.');
                                            setApplication((prev) =>
                                                prev
                                                    ? ({
                                                        ...prev,
                                                        courierTelegramId: masterId,
                                                    } as any)
                                                    : prev
                                            );
                                        }
                                    }}
                                >
                                    {Boolean((application as any)?.courierTelegramId)
                                        ? `Мастер назначен${(application as any).courierTimeSlot ? ` — ${
                                              (application as any).courierTimeSlot
                                          }` : ' — время не выбрано'}`
                                        : 'Назначить мастера и время '}
                                </Button>
                            )}
                            {(application as any)?.courierUserConfirmed && application?.status === 'on_the_way' && (
                                <Button className="min-w-[200px]" onClick={handleCourierReceived}>
                                    Телефон у мастера
                                </Button>
                            )}
                            {application?.status === 'paid' && (
                                <Button className="min-w-[200px]" onClick={handleMarkPaid}>
                                    Оплачено
                                </Button>
                            )}
                            {application?.status === 'completed' && (
                                <section className="text-black border-2 rounded-md border-slate-700 p-2 min-w-[200px] text-center">
                                    Заявка выполнена
                                </section>
                            )}
                        </div>
                    </CardAction>
                    <section className="flex flex-col gap-2 p-4">
                        <Button>
                            <Link href="/admin/requests">Все заявки</Link>
                        </Button>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestById;