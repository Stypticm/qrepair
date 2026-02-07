'use client';

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

const FinalPage = () => {
    const router = useRouter();
    const { telegramId, username, modelname, price, damagePercent, resetAllStates, setCurrentStep, setUserEvaluation, setDamagePercent } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [userTelegramId, setUserTelegramId] = useState('');
    const [telegramIdConfirmed, setTelegramIdConfirmed] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState('');
    const [showThankYou, setShowThankYou] = useState(false);
    const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number; midpoint: number } | null>(null);

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('final');

        // Сохраняем текущий шаг в БД
        const saveCurrentStep = async () => {
            try {
                await fetch('/api/request/saveCurrentStep', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        currentStep: 'final',
                    }),
                });
            } catch (error) {
                console.error('Error saving current step:', error);
            }
        };

        if (telegramId) {
            saveCurrentStep();
        }
    }, [setCurrentStep, telegramId]);

    // Загружаем telegramId из store или sessionStorage при инициализации
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('Final page - username:', username, 'telegramId:', telegramId);

            // Используем данные из Zustand store
            if (username) {
                setUserTelegramId(`@${username}`);
                setTelegramUsername(username);
                console.log('Set username from store:', username);
            } else if (telegramId) {
                setUserTelegramId(telegramId);
                setTelegramUsername(telegramId);
                console.log('Set telegramId as fallback:', telegramId);
            } else {
                // Проверяем sessionStorage как последний fallback
                const savedUsername = sessionStorage.getItem('telegramUsername');
                const savedTelegramId = sessionStorage.getItem('telegramId');

                if (savedUsername) {
                    setUserTelegramId(`@${savedUsername}`);
                    setTelegramUsername(savedUsername);
                    console.log('Set username from sessionStorage:', savedUsername);
                } else if (savedTelegramId) {
                    setUserTelegramId(savedTelegramId);
                    setTelegramUsername(savedTelegramId);
                    console.log('Set telegramId from sessionStorage:', savedTelegramId);
                } else {
                    // Fallback для тестирования в браузере
                    if (process.env.NODE_ENV === 'development') {
                        setUserTelegramId('@qoqos_support');
                        setTelegramUsername('qoqos_support');
                        console.log('Set development fallback');
                    }
                }
            }
        }
    }, [telegramId, username]);

    // Загружаем данные о выборе доставки из sessionStorage или БД
    const [deliveryData, setDeliveryData] = useState<any>(null);

    useEffect(() => {
        const loadDeliveryData = async () => {
            if (typeof window !== 'undefined') {
                // Пробуем взять из sessionStorage единый объект deliveryData
                const savedDeliveryData = sessionStorage.getItem('deliveryData');
                if (savedDeliveryData) {
                    try {
                        const parsed = JSON.parse(savedDeliveryData);
                        setDeliveryData(parsed);
                        return;
                    } catch { }
                }
                // Fallback на старые ключи (обратная совместимость)
                const deliveryOptionsData = sessionStorage.getItem('deliveryOptionsData');
                let deliveryMethod = 'pickup';
                if (deliveryOptionsData) {
                    try {
                        const parsed = JSON.parse(deliveryOptionsData);
                        deliveryMethod = parsed.selectedOption || 'pickup';
                    } catch { }
                }
                if (deliveryMethod === 'courier') {
                    const savedCourierData = sessionStorage.getItem('courierData');
                    if (savedCourierData) {
                        try {
                            const parsed = JSON.parse(savedCourierData);
                            setDeliveryData({
                                deliveryMethod: 'courier',
                                courier: {
                                    address: parsed.address,
                                    date: parsed.selectedDate,
                                    time: parsed.selectedTime,
                                },
                            });
                            return;
                        } catch { }
                    }
                } else {
                    const savedPickupData = sessionStorage.getItem('pickupData');
                    if (savedPickupData) {
                        try {
                            const parsed = JSON.parse(savedPickupData);
                            setDeliveryData({
                                deliveryMethod: 'pickup',
                                pickupPoint: parsed.selectedPoint || 'Адрес не указан',
                            });
                            return;
                        } catch { }
                    }
                    // Fallback: пытаемся получить из БД
                    try {
                        const effectiveTelegramId = telegramId || 'browser_test_user';
                        const response = await fetch('/api/request/getDraft', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                telegramId: effectiveTelegramId,
                            }),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.draft) {
                                setDeliveryData({
                                    deliveryMethod: 'pickup',
                                    pickupPoint: data.draft.pickupPoint || 'Адрес не указан',
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error loading delivery data from DB:', error);
                    }
                }
            }
        };

        loadDeliveryData();
    }, [telegramId]);

    // Загружаем диапазон цены из sessionStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPriceRange = sessionStorage.getItem('priceRange');
            if (savedPriceRange) {
                try {
                    const parsed = JSON.parse(savedPriceRange);
                    if (parsed && typeof parsed.min === 'number' && typeof parsed.max === 'number') {
                        setPriceRange(parsed);
                    }
                } catch (e) {
                    console.error('Error parsing priceRange:', e);
                }
            }
        }
    }, []);


    const handleFinalSubmit = async () => {
        if (!userTelegramId.trim()) {
            return;
        }

        setSubmitting(true);
        try {
            // Используем fallback для браузера, если telegramId не установлен
            const effectiveTelegramId = telegramId || 'browser_test_user';

            const requestData = {
                telegramId: effectiveTelegramId,
                userTelegramId: userTelegramId.trim(),
                username: telegramUsername,
                modelname: getFullModelName(),
                price: finalPrice,
                priceRange,
                formattedPriceRange: formattedRange || null,
                deliveryData,
            };

            const response = await fetch('/api/request/submit-final', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const result = await response.json();
                setTelegramIdConfirmed(true);
                setShowThankYou(true);
                if (result?.requestId) {
                    setCreatedRequestId(result.requestId);
                }
                // Очищаем выбор оценки после успешной отправки заявки
                setUserEvaluation(null);
                setDamagePercent(0);
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('userEvaluation');
                    sessionStorage.removeItem('damagePercent');
                }
                // Больше не редиректим автоматически, даём показать QR
            } else {
                console.error('❌ Final submit - ошибка API:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ Final submit - текст ошибки:', errorText);
            }
        } catch (error) {
            console.error('Ошибка при отправке заявки:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // На предыдущих шагах цена уже учитывает состояние. Повторно не уменьшаем.
    const finalPrice = price || priceRange?.midpoint || 0;
    const formattedRange = useMemo(() => {
        if (!priceRange) return null;
        const fmt = (n: number) => n.toLocaleString('ru-RU');
        return `${fmt(priceRange.min)} — ${fmt(priceRange.max)} ₽`;
    }, [priceRange]);

    // Функция для формирования полной модели
    const getFullModelName = (): string => {
        if (typeof window !== 'undefined') {
            const savedPhoneSelection = sessionStorage.getItem('phoneSelection');
            if (savedPhoneSelection) {
                try {
                    const parsed = JSON.parse(savedPhoneSelection);
                    let fullModel = `iPhone ${parsed.model}`;

                    if (parsed.variant) {
                        fullModel += ` ${parsed.variant}`;
                    }

                    if (parsed.storage) {
                        fullModel += ` ${parsed.storage}`;
                    }

                    if (parsed.color) {
                        const colorMap: { [key: string]: string } = {
                            'G': 'Золотой',
                            'R': 'Красный',
                            'Bl': 'Синий',
                            'Wh': 'Белый',
                            'C': 'Черный'
                        };
                        const colorLabel = colorMap[parsed.color] || parsed.color;
                        fullModel += ` ${colorLabel}`;
                    }

                    if (parsed.simType) {
                        fullModel += ` ${parsed.simType}`;
                    }

                    if (parsed.country) {
                        fullModel += ` ${parsed.country.split(' ')[0]}`;
                    }

                    return fullModel;
                } catch (e) {
                    console.error('Error parsing phoneSelection:', e);
                }
            }
        }

        const cleanModelName = modelname ? modelname.replace(/^Apple\s+/, '') : 'Модель не найдена';
        return cleanModelName;
    };

    const getDeliveryInfo = () => {
        if (!deliveryData) return null;

        if (deliveryData.deliveryMethod === 'pickup') {
            return {
                method: 'Личная доставка',
                details: deliveryData.pickupPoint
            };
        } else if (deliveryData.deliveryMethod === 'courier') {
            const d = deliveryData.courier;
            return {
                method: 'Мастер',
                details: `${d?.address || 'Не указан'}${d?.date ? ' - ' + new Date(d.date).toLocaleDateString('ru-RU') : ''}${d?.time ? ' в ' + d.time : ''}`
            };
        }

        return null;
    };

    const deliveryInfo = getDeliveryInfo();

    if (submitted) {
        return (
            <Page back={false}>
                <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-hidden">
                    <div className="flex-1 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center max-w-md mx-auto"
                        >
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="w-32 h-32 mx-auto mb-6 flex items-center justify-center"
                            >
                                <Image
                                    src={getPictureUrl('logo_bye.png') || '/logo_bye.png'}
                                    alt="До свидания"
                                    width={128}
                                    height={128}
                                    className="object-contain rounded-2xl"
                                />
                            </motion.div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Спасибо за использование нашего сервиса!
                            </h2>
                            <p className="text-gray-700 mb-4">
                                ✅ Ваша заявка успешно отправлена.
                            </p>
                            <p className="text-gray-700 mb-6">
                                📞 Менеджер свяжется с вами для уточнения деталей и подтверждения времени. ⏳
                            </p>
                            <div className="flex items-center justify-center space-x-2 text-[#2dc2c6]">
                                <div className="w-2 h-2 bg-[#2dc2c6] rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-[#2dc2c6] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-[#2dc2c6] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Page>
        );
    }

    // Если показываем страницу благодарности
    if (showThankYou) {
        return (
            <Page back={false}>
                <div className="w-full h-screen bg-white flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-center max-w-md mx-auto space-y-3"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900">Заявка отправлена</h2>
                            <p className="text-gray-600 text-sm">Покажите этот QR-код мастеру</p>
                            {createdRequestId && (
                                <div className="my-2">
                                    <QRCodeGenerator skupkaId={createdRequestId} pointId={1} showDownload={false} showId={false} />
                                </div>
                            )}
                            <p className="text-gray-700 text-base">📞 Менеджер свяжется с вами для уточнения деталей.</p>
                            <div className="pt-2">
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                    className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50"
                                >
                                    На главную
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Page>
        );
    }

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-hidden">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4">
                        {/* Заголовок */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Подтверждение заявки
                            </h2>
                            <p className="text-gray-600">
                                Проверьте данные и подтвердите отправку
                            </p>
                        </motion.div>

                        {/* Информация о заявке */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                        >
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Устройство:</h3>
                                    <p className="text-gray-700">{getFullModelName()}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Диапазон цены:</h3>
                                    <p className="text-2xl font-bold text-green-600">{formattedRange || 'уточняется'}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Это ориентировочный диапазон цены. Точную цену назовём после бесплатной диагностики. Если состояние соответствует описанию, цена будет в пределах указанного диапазона.
                                    </p>
                                </div>

                                {deliveryInfo && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Способ передачи:</h3>
                                        <p className="text-gray-700">{deliveryInfo.method}</p>
                                        <p className="text-sm text-gray-600">{deliveryInfo.details}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Поле для Telegram username */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                        >
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Ваш Telegram:</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {telegramUsername
                                            ? `Мы получили ваш Telegram: @${telegramUsername}. Вы можете изменить его при необходимости.`
                                            : 'Введите ваш Telegram для связи'
                                        }
                                    </p>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={userTelegramId}
                                            onChange={(e) => setUserTelegramId(e.target.value)}
                                            placeholder="username"
                                            className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-sm"
                                        />
                                    </div>

                                </div>
                            </div>
                        </motion.div>

                        {/* Кнопка подтверждения */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <Button
                                onClick={handleFinalSubmit}
                                disabled={submitting || !userTelegramId.trim()}
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50"
                            >
                                {submitting ? 'Отправляем заявку...' : 'Отправить заявку'}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default FinalPage;
