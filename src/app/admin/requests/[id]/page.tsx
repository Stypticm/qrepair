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
import { Page } from '@/components/Page';

const RequestById = () => {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [application, setApplication] = useState<SkupkaRequest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [priceInput, setPriceInput] = useState<string>('');
    const [priceDirty, setPriceDirty] = useState<boolean>(false);
    const [showPhotos, setShowPhotos] = useState<boolean>(false);
    const [masterPhotos, setMasterPhotos] = useState<string[]>([]);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

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
                // Загружаем фото из базы данных
                if (data?.photoUrls && Array.isArray(data.photoUrls)) {
                    setMasterPhotos(data.photoUrls);
                }
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

    const handlePhotoUpload = async () => {
        if (!photoFile) return;
        
        try {
            const formData = new FormData();
            formData.append('photo', photoFile);
            formData.append('requestId', id as string);
            
            const response = await fetch('/api/admin/upload-master-photo', {
                method: 'POST',
                body: formData,
            });
            
            if (response.ok) {
                const data = await response.json();
                // Обновляем локальное состояние из ответа API
                if (data.skupka?.photoUrls) {
                    setMasterPhotos(data.skupka.photoUrls);
                }
                setPhotoFile(null);
                // Обновляем заявку
                const updatedApp = await fetchApplication(id as string);
                setApplication(updatedApp);
            } else {
                setError('Ошибка загрузки фото');
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError('Ошибка загрузки фото');
        }
    };

    return (
        <Page back={true}>
            <div className="min-h-screen bg-gray-900">
                <div className="flex flex-col h-screen">
                    <div className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            <Card className="w-full bg-gray-800 border-gray-700 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">Заявка {id}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <CardDescription className="text-gray-300">
                                        <p className="text-white">Модель телефона: {application?.modelname}</p>
                                        <p className="text-white">Предварительная цена: {application?.price ?? '—'} ₽</p>
                                        <div className="flex flex-col items-center gap-2 mt-2">
                                            {(() => {
                                                const isEditable = application?.status === 'accepted';
                                                return (
                                                    <input
                                                        className={`rounded px-2 py-1 text-white bg-gray-700 border-gray-600 ${!isEditable ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                        type="number"
                                                        placeholder="Итоговая цена"
                                                        value={priceInput}
                                                        onChange={(e) => { setPriceDirty(true); setPriceInput(e.target.value); }}
                                                        disabled={!isEditable}
                                                    />
                                                );
                                            })()}
                                            <Button variant="outline" onClick={() => setShowPhotos((v) => !v)} className="text-gray-700 border-gray-600 hover:bg-gray-700">
                                                {showPhotos ? 'Скрыть фото' : 'Посмотреть фото'}
                                            </Button>
                                        </div>
                                        {application?.status !== 'accepted' && (
                                            <p className="text-gray-400 text-sm mt-1">Цена уже отправлена клиенту и недоступна для изменения.</p>
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
                                        
                                        {/* Форма для загрузки фото мастером - доступна только когда мастер назначен */}
                                        {(application as any)?.courierTelegramId && (
                                            <div className="mt-4 p-3 border border-gray-600 rounded-md bg-gray-700">
                                            <h4 className="text-white font-semibold mb-2">Добавить фото мастера (максимум 3)</h4>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-white text-sm font-medium">
                                                        Выберите файл:
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                                        className="text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        disabled={masterPhotos.length >= 3}
                                                    />
                                                    {photoFile ? (
                                                        <p className="text-green-400 text-sm">
                                                            Выбран файл: {photoFile.name}
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-400 text-sm">
                                                            Файл не выбран
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="border-t border-gray-600 pt-2">
                                                    <Button 
                                                        onClick={handlePhotoUpload}
                                                        disabled={!photoFile || masterPhotos.length >= 3}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                                    >
                                                        {masterPhotos.length >= 3 ? 'Достигнут лимит фото' : 'Загрузить фото'}
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {/* Разделитель */}
                                            <div className="border-t border-gray-600 my-3"></div>
                                            
                                            {/* Отображение загруженных фото мастера */}
                                            {masterPhotos.length > 0 && (
                                                <div className="mt-3">
                                                    <h5 className="text-white font-semibold mb-2">
                                                        Фото мастера: {masterPhotos.length}/3
                                                    </h5>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {masterPhotos.map((url, idx) => (
                                                            <div key={idx} className="relative">
                                                                <Image
                                                                    src={url}
                                                                    alt={`Фото мастера ${idx + 1}`}
                                                                    className="w-full h-24 object-cover rounded"
                                                                    width={100}
                                                                    height={100}
                                                                />
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const response = await fetch(`/api/admin/delete-master-photo?requestId=${id}&photoUrl=${url}`, {
                                                                                method: 'DELETE'
                                                                            });
                                                                            
                                                                            if (response.ok) {
                                                                                const data = await response.json();
                                                                                // Обновляем локальное состояние
                                                                                if (data.skupka?.photoUrls) {
                                                                                    setMasterPhotos(data.skupka.photoUrls);
                                                                                }
                                                                                // Обновляем заявку
                                                                                const updatedApp = await fetchApplication(id as string);
                                                                                setApplication(updatedApp);
                                                                            } else {
                                                                                setError('Ошибка удаления фото');
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Error deleting photo:', err);
                                                                            setError('Ошибка удаления фото');
                                                                        }
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {masterPhotos.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-400 text-sm">
                                                        Загрузите фото устройства для оценки
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Максимум 3 фото
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        )}
                                        <p className="text-white flex flex-col gap-1">
                                            <span>
                                                Статус:{' '}
                                                <Badge className="bg-emerald-600 text-white">
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
                                                    <Badge className={application?.priceConfirmed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                                                        {application?.priceConfirmed ? 'Цена подтверждена' : 'Цена не подтверждена'}
                                                    </Badge>
                                                </span>
                                            )}
                                        </p>
                                    </CardDescription>
                                    {(application as any)?.courierTelegramId && (
                                        <div className="mt-3 p-3 rounded-md border border-gray-600 bg-gray-700 text-white">
                                            <p className="font-semibold">Детали выезда мастера</p>
                                            <p>Мастер: @{(application as any).courierTelegramId}</p>
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
                                                <Button className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAcceptRequest}>
                                                    Принять заявку
                                                </Button>
                                            )}
                                            {application?.status === 'in_progress' && (
                                                <Button
                                                    className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={handleReviewRequest}
                                                    disabled={!application?.price || !(application as any)?.priceConfirmed}
                                                >
                                                    Цена подтверждена
                                                </Button>
                                            )}
                                            {application && (
                                                <Button
                                                    className="min-w-[200px] text-gray-300 border-gray-600 hover:bg-gray-700"
                                                    variant="outline"
                                                    disabled={Boolean((application as any)?.courierTelegramId)}
                                                    onClick={async () => {
                                                        if ((application as any)?.courierTelegramId) return;
                                                        const masterUsername = prompt('Введите Telegram username мастера (без @):');
                                                        if (!masterUsername) return;
                                                        const res = await fetch(`/api/courier/schedule/${application.id}`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ masterUsername }),
                                                        });
                                                        const data = await res.json();
                                                        if (!res.ok) alert(data?.error || 'Ошибка назначения мастера');
                                                        else {
                                                            alert('Мастер назначен. Пользователю отправлен выбор времени.');
                                                            setApplication((prev) =>
                                                                prev
                                                                    ? ({
                                                                        ...prev,
                                                                        courierTelegramId: masterUsername,
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
                                                <Button className="min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCourierReceived}>
                                                    Телефон у мастера
                                                </Button>
                                            )}
                                            {application?.status === 'paid' && (
                                                <Button className="min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkPaid}>
                                                    Оплачено
                                                </Button>
                                            )}
                                            {application?.status === 'completed' && (
                                                <section className="text-white border-2 rounded-md border-gray-600 bg-gray-700 p-2 min-w-[200px] text-center">
                                                    Заявка выполнена
                                                </section>
                                            )}
                                        </div>
                                    </CardAction>
                                    <section className="flex flex-col gap-2 p-4">
                                        <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                                            <Link href="/admin/requests">Все заявки</Link>
                                        </Button>
                                    </section>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default RequestById;