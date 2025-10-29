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

    const [masterPhotos, setMasterPhotos] = useState<string[]>([]);
    const [photoFiles, setPhotoFiles] = useState<{
        front: File | null;
        side: File | null;
        back: File | null;
    }>({
        front: null,
        side: null,
        back: null
    });
    const [otpCode, setOtpCode] = useState<string>('');
    const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);


    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Ссылка скопирована в буфер обмена!');
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Ссылка скопирована в буфер обмена!');
        }
    };

    const generateOTP = async () => {
        if (!application?.telegramId) {
            setError('Telegram ID клиента не найден');
            return;
        }

        setIsGeneratingOtp(true);
        try {
            // Генерируем случайный 6-значный OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setOtpCode(newOtp);

            // Отправляем OTP клиенту в Telegram
            const message = `🔐 **OTP код для проверки устройства**\n\n📋 **ID заявки:** \`${application.id}\`\n👨‍🔧 **Мастер:** @${(application as any).courierTelegramId}\n\n🔢 **Ваш OTP код:** \`${newOtp}\`\n\n💡 **Инструкция:**\n1️⃣ Скачайте приложение **Qoqos** из App Store/Google Play\n2️⃣ Откройте приложение\n3️⃣ Введите ID заявки: \`${application.id}\`\n4️⃣ Введите имя мастера: \`${(application as any).courierTelegramId}\`\n5️⃣ Введите OTP код: \`${newOtp}\`\n\n⏰ **Код действителен 15 минут**\n\n🔐 **Безопасно:** код отправлен только вам`;

            const response = await fetch('/api/telegram/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: application.telegramId,
                    message: message
                })
            });

            if (response.ok) {
                alert(`OTP код ${newOtp} отправлен клиенту! Код действителен 15 минут.`);
            } else {
                setError('Ошибка отправки OTP');
            }
        } catch (err) {
            console.error('Error generating OTP:', err);
            setError('Ошибка генерации OTP');
        } finally {
            setIsGeneratingOtp(false);
        }
    };

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

    const handleSendRequestId = async () => {
        if (!application?.telegramId) {
            setError('Telegram ID клиента не найден');
            return;
        }

        try {
            const message = `🔍 **Полная проверка устройства**\n\n📋 **ID заявки:** \`${application.id}\`\n💡 **Нажмите на ID выше, чтобы скопировать**\n👨‍🔧 **Мастер:** @${(application as any).courierTelegramId}\n\n📱 **Инструкция для клиента:**\n1️⃣ Скачайте приложение **Qoqos** из App Store/Google Play\n2️⃣ Откройте приложение\n3️⃣ Введите ID заявки: \`${application.id}\`\n4️⃣ Введите имя мастера: \`${(application as any).courierTelegramId}\`\n5️⃣ **Дождитесь OTP код** от мастера\n6️⃣ Введите OTP код в приложение\n7️⃣ **Мастер проведет тест** устройства\n8️⃣ Вы наблюдаете и подтверждаете результаты\n\n💡 **Зачем это нужно:**\n• Точная оценка стоимости\n• Профессиональная проверка\n• Справедливая цена\n\n⏰ **Время:** ~5-10 минут\n\n🔐 **Безопасно:** OTP код отправляется только вам\n\nℹ️ **Важно:** Тест проводит мастер, вы только присутствуете при проверке`;

            const response = await fetch('/api/telegram/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: application.telegramId,
                    message: message
                })
            });

            if (response.ok) {
                alert('ID заявки отправлен клиенту в Telegram!');
            } else {
                setError('Ошибка отправки сообщения');
            }
        } catch (err) {
            console.error('Error sending request ID:', err);
            setError('Ошибка отправки ID заявки');
        }
    };

    const handlePhotoUpload = async () => {
        const files = [photoFiles.front, photoFiles.side, photoFiles.back].filter(Boolean);
        if (files.length === 0) return;

        try {
            // Загружаем все фото по очереди
            for (const file of files) {
                if (!file) continue;

                const formData = new FormData();
                formData.append('photo', file);
                formData.append('requestId', id as string);

                const response = await fetch('/api/admin/upload-master-photo', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки фото');
                }
            }

            // Обновляем заявку и фото
            const updatedApp = await fetchApplication(id as string);
            setApplication(updatedApp);
            if (updatedApp?.photoUrls && Array.isArray(updatedApp.photoUrls)) {
                setMasterPhotos(updatedApp.photoUrls);
            }

            // Сбрасываем все файлы
            setPhotoFiles({ front: null, side: null, back: null });

            // Очищаем все input файлы
            const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
            fileInputs.forEach(input => input.value = '');

        } catch (err) {
            console.error('Error uploading photos:', err);
            setError('Ошибка загрузки фото');
        }
    };

    return (
        <Page back={true}>
            <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar admin-masters-scroll" style={{ height: 'calc(100vh - 120px)', overflowY: 'scroll', paddingTop: 'env(--safe-area-top, 60px)' }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 mt-12">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">📋 Заявка {id}</h1>
                            <p className="text-gray-600">Детальная информация о заявке</p>
                        </div>
                        <Card className="w-full bg-white border border-gray-200 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-gray-900 text-2xl font-semibold">Заявка {id}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <CardDescription className="text-gray-600">
                                    <p className="text-gray-900 font-medium">Модель телефона: {application?.modelname}</p>
                                    <p className="text-gray-900 font-medium">Предварительная цена: {application?.price ?? '—'} ₽</p>
                                    
                                    {/* Отображение согласия с ценой и feedback */}
                                    {(application as any)?.priceAgreed !== undefined && (
                                        <div className="mt-3 p-3 rounded-xl border">
                                            <p className="text-gray-900 font-medium mb-2">
                                                Согласие с ценой: 
                                                <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                                                    (application as any)?.priceAgreed 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {(application as any)?.priceAgreed ? 'Согласен' : 'Не согласен'}
                                                </span>
                                            </p>
                                            
                                            {(application as any)?.feedback && (
                                                <div className="mt-2">
                                                    <p className="text-gray-700 font-medium mb-1">💬 Отзыв пользователя:</p>
                                                    <div className="bg-gray-50 p-3 rounded-lg border">
                                                        <p className="text-gray-800 italic">&quot;{((application as any)?.feedback)}&quot;</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-2 mt-2">
                                        {(() => {
                                            const isEditable = application?.status === 'accepted';
                                            return (
                                                                                             <input
                                                 className={`rounded-lg px-3 py-2 text-gray-900 bg-white border border-gray-300 focus:border-[#2dc2c6] focus:ring-2 focus:ring-[#2dc2c6]/20 transition-all duration-200 ${!isEditable ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                                                 type="number"
                                                 placeholder="Итоговая цена"
                                                 value={priceInput}
                                                 onChange={(e) => { setPriceDirty(true); setPriceInput(e.target.value); }}
                                                 disabled={!isEditable}
                                             />
                                            );
                                        })()}
                                    </div>
                                                                             {application?.status !== 'accepted' && (
                                             <p className="text-gray-500 text-sm mt-1">Цена уже отправлена клиенту и недоступна для изменения.</p>
                                         )}

                                                                             {/* Форма для загрузки фото мастером - доступна только когда мастер назначен */}
                                         {(application as any)?.courierTelegramId && (
                                             <div className="mt-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                                             <h4 className="text-gray-900 font-semibold mb-2 text-lg">📸 Добавить фото устройства</h4>
                                             <p className="text-gray-600 text-sm mb-3">Загрузите основные ракурсы для точной оценки</p>
                                            <div className="flex flex-col gap-4">
                                                {/* Лицевая часть */}
                                                                                                 <div className="flex flex-col gap-2">
                                                     <label className="text-gray-700 text-sm font-medium">📱 Лицевая часть устройства</label>
                                                     <input
                                                         type="file"
                                                         accept="image/*"
                                                         onChange={(e) => setPhotoFiles(prev => ({ ...prev, front: e.target.files?.[0] || null }))}
                                                         className="text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2dc2c6] file:text-white hover:file:bg-[#25a8ac] transition-all duration-200"
                                                     />
                                                     <p className="text-gray-500 text-xs">
                                                         {photoFiles.front ? photoFiles.front.name : 'Файл не выбран'}
                                                     </p>
                                                 </div>

                                                                                                 {/* Боковая часть */}
                                                 <div className="flex flex-col gap-2">
                                                     <label className="text-gray-700 text-sm font-medium">📐 Боковая часть устройства</label>
                                                     <input
                                                         type="file"
                                                         accept="image/*"
                                                         onChange={(e) => setPhotoFiles(prev => ({ ...prev, side: e.target.files?.[0] || null }))}
                                                         className="text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2dc2c6] file:text-white hover:file:bg-[#25a8ac] transition-all duration-200"
                                                     />
                                                     <p className="text-gray-500 text-xs">
                                                         {photoFiles.side ? photoFiles.side.name : 'Файл не выбран'}
                                                     </p>
                                                 </div>

                                                                                                 {/* Задняя часть */}
                                                 <div className="flex flex-col gap-2">
                                                     <label className="text-gray-700 text-sm font-medium">📷 Задняя часть устройства</label>
                                                     <input
                                                         type="file"
                                                         accept="image/*"
                                                         onChange={(e) => setPhotoFiles(prev => ({ ...prev, back: e.target.files?.[0] || null }))}
                                                         className="text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2dc2c6] file:text-white hover:file:bg-[#25a8ac] transition-all duration-200"
                                                     />
                                                     <p className="text-gray-500 text-xs">
                                                         {photoFiles.back ? photoFiles.back.name : 'Файл не выбран'}
                                                     </p>
                                                 </div>

                                                                                                 <div className="border-t border-gray-200 pt-4">
                                                                                                         <Button 
                                                         onClick={handlePhotoUpload}
                                                         disabled={!photoFiles.front && !photoFiles.side && !photoFiles.back}
                                                         className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white text-sm shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 font-semibold"
                                                     >
                                                         📤 Загрузить выбранные фото
                                                     </Button>
                                                     <p className="text-gray-500 text-xs text-center mt-2">
                                                         Можно загрузить от 1 до 3 фото одновременно
                                                     </p>
                                                </div>
                                            </div>

                                                                                         {/* Разделитель */}
                                             <div className="border-t border-gray-200 my-4"></div>

                                            {/* Отображение загруженных фото мастера */}
                                            {masterPhotos.length > 0 && (
                                                                                                 <div className="mt-4">
                                                     <h5 className="text-gray-900 font-semibold mb-3 text-lg">
                                                         📱 Загруженные фото: {masterPhotos.length}/3
                                                     </h5>
                                                     <div className="text-gray-600 text-sm mb-3">
                                                         {masterPhotos.length === 1 && "1️⃣ Лицевая часть"}
                                                         {masterPhotos.length === 2 && "1️⃣ Лицевая часть • 2️⃣ Боковая часть"}
                                                         {masterPhotos.length === 3 && "1️⃣ Лицевая часть • 2️⃣ Боковая часть • 3️⃣ Задняя часть"}
                                                     </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {masterPhotos.map((url, idx) => (
                                                            <div key={idx} className="relative">
                                                                л                                                                <Image
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
                                                     <p className="text-gray-500 text-sm">
                                                         📸 Загрузите фото устройства для оценки
                                                     </p>
                                                     <p className="text-gray-400 text-xs mt-1">
                                                         Рекомендуется: лицевая, боковая, задняя части
                                                     </p>
                                                 </div>
                                             )}
                                        </div>
                                    )}
                                                                         <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                         <p className="text-gray-900 font-medium mb-2">Статус заявки:</p>
                                         <div className="flex flex-wrap gap-2">
                                             <Badge className="bg-[#2dc2c6] text-white px-3 py-1 rounded-full text-sm font-medium">
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
                                            {(application?.status === 'in_progress' || application?.status === 'on_the_way') && (
                                                <Badge className={`${(application as any)?.priceConfirmed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} px-3 py-1 rounded-full text-sm font-medium`}>
                                                    {(application as any)?.priceConfirmed ? 'Цена подтверждена' : 'Цена не подтверждена'}
                                                </Badge>
                                            )}
                                         </div>
                                     </div>
                                </CardDescription>
                                                                 {(application as any)?.courierTelegramId && (
                                     <div className="mt-4 p-4 rounded-2xl border border-gray-200 bg-blue-50">
                                         <p className="font-semibold text-blue-900 mb-2">👨‍🔧 Детали выезда мастера</p>
                                         <div className="space-y-2 text-blue-800">
                                             <p><span className="font-medium">Мастер:</span> @{(application as any).courierTelegramId}</p>
                                             {(application as any).courierTimeSlot && <p><span className="font-medium">Выбранное время:</span> {(application as any).courierTimeSlot}</p>}
                                             {(application as any).courierScheduledAt && (
                                                 <p>
                                                     <span className="font-medium">Назначено на:</span>{' '}
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
                                             <p><span className="font-medium">Подтверждение клиента:</span> {(application as any).courierUserConfirmed ? '✅ Да' : '❌ Нет'}</p>
                                         </div>
                                     </div>
                                 )}
                                <CardAction className="self-center pt-2 w-full">
                                    <div className="flex flex-wrap justify-center gap-2 w-full">
                                        {application?.status === 'accepted' && (
                                            <Button className="min-w-[200px] bg-[#2dc2c6] hover:bg-[#25a8ac] text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold" onClick={handleAcceptRequest}>
                                                Принять заявку
                                            </Button>
                                        )}
                                        {application?.status === 'in_progress' && (
                                            <Button
                                                className="min-w-[200px] bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold"
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
                                                    ? `Мастер назначен${(application as any).courierTimeSlot ? ` — ${(application as any).courierTimeSlot
                                                        }` : ' — время не выбрано'}`
                                                    : 'Назначить мастера и время '}
                                            </Button>
                                        )}
                                        {(application as any)?.courierUserConfirmed && application?.status === 'on_the_way' && (
                                            <Button className="min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold" onClick={handleCourierReceived}>
                                                Телефон у мастера
                                            </Button>
                                        )}

                                        {/* Кнопка отправки ID заявки клиенту */}
                                        {(application as any)?.courierTelegramId && application?.status === 'on_the_way' && (
                                            <Button
                                                className="min-w-[200px] bg-orange-600 hover:bg-orange-700 text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold"
                                                onClick={handleSendRequestId}
                                            >
                                                📱 Отправить ID заявки
                                            </Button>
                                        )}

                                        {/* OTP система для мастера */}
                                        {(application as any)?.courierTelegramId && application?.status === 'on_the_way' && (
                                            <div className="min-w-[200px] p-3 bg-green-900 border border-green-600 rounded text-center">
                                                <p className="text-green-200 text-sm font-semibold">🔐 OTP система</p>

                                                {otpCode ? (
                                                    <div className="mt-2">
                                                        <p className="text-green-100 text-xs">Текущий OTP:</p>
                                                        <p className="text-green-200 text-lg font-bold font-mono">{otpCode}</p>
                                                        <p className="text-green-100 text-xs mt-1">Действителен 15 мин</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-green-100 text-xs mt-1">OTP не сгенерирован</p>
                                                )}

                                                <Button
                                                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                                                    onClick={generateOTP}
                                                    disabled={isGeneratingOtp}
                                                >
                                                    {isGeneratingOtp ? '⏳ Генерирую...' : '🔢 Сгенерировать OTP'}
                                                </Button>

                                                {otpCode && (
                                                    <Button
                                                        className="mt-1 w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1"
                                                        onClick={() => copyToClipboard(otpCode)}
                                                    >
                                                        📋 Скопировать OTP
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                                                                 {/* Кнопка копирования ID заявки */}
                                         <Button 
                                             className="min-w-[200px] bg-gray-600 hover:bg-gray-700 text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold"
                                             onClick={() => copyToClipboard(application?.id || '')}
                                         >
                                             ID: {application?.id}
                                         </Button>
                                        {application?.status === 'paid' && (
                                            <Button className="min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl h-12 text-lg font-semibold" onClick={handleMarkPaid}>
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



                                
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default RequestById;