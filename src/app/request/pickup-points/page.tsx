'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

const PickupPointsPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price, setCurrentStep } = useAppStore();
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [pickupPoints, setPickupPoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('pickup-points');

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
                        currentStep: 'pickup-points',
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

    // Загружаем точки приема из БД
    useEffect(() => {
        const loadPickupPoints = async () => {
            try {
                setLoading(true);
                console.log('🔍 Loading pickup points...');
                const response = await fetch('/api/points');
                console.log('🔍 Points API response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 Points API response data:', data);
                    // API возвращает { success: true, points: [...] }
                    const points = data.points || [];
                    setPickupPoints(Array.isArray(points) ? points : []);
                    console.log('🔍 Set pickup points:', points);
                } else {
                    console.error('Ошибка загрузки точек приема:', response.status, response.statusText);
                    setPickupPoints([]);
                }
            } catch (error) {
                console.error('Ошибка загрузки точек приема:', error);
                setPickupPoints([]);
            } finally {
                setLoading(false);
            }
        };

        loadPickupPoints();
    }, []);

    // Восстанавливаем состояние из sessionStorage при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPickupData = sessionStorage.getItem('pickupPointsData');
            if (savedPickupData) {
                try {
                    const parsed = JSON.parse(savedPickupData);
                    if (parsed.selectedPoint) setSelectedPoint(parsed.selectedPoint);
                } catch (e) {
                    console.error('Ошибка при восстановлении данных приема:', e);
                    sessionStorage.removeItem('pickupPointsData');
                }
            }
        }
    }, []);

    // Сохраняем состояние в sessionStorage при изменениях
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedPoint) {
            const pickupData = { selectedPoint };
            sessionStorage.setItem('pickupPointsData', JSON.stringify(pickupData));
        }
    }, [selectedPoint]);


    const handlePointSelect = (pointId: string) => {
        setSelectedPoint(pointId);
    };

    // Автопереход убран: второй клик на уже выбранной карточке запускает переход

    const handleSubmit = async () => {
        if (!selectedPoint) return;

        // Блокируем кнопки сразу при нажатии
        setButtonsDisabled(true);
        setSubmitting(true);
        try {
            const selectedPointData = Array.isArray(pickupPoints) ? pickupPoints.find(p => p.id === selectedPoint) : null;

            console.log('🔍 Pickup point selection:', {
                selectedPoint,
                selectedPointData,
                pickupPoints: pickupPoints.length,
                address: selectedPointData?.address
            });

            // Используем fallback для браузера, если telegramId не установлен
            const effectiveTelegramId = telegramId || 'browser_test_user';

            const requestData = {
                telegramId: effectiveTelegramId,
                modelname: getFullModelName(),
                price: finalPrice,
                deliveryMethod: 'pickup',
                pickupPoint: selectedPointData?.address,
            };

            console.log('🔍 Request data for delivery:', requestData);

            // Сохраняем выбор в БД
            const response = await fetch('/api/request/submit-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const result = await response.json();

                // Сохраняем данные о доставке в sessionStorage
                const deliveryData = {
                    deliveryMethod: 'pickup',
                    pickupPoint: selectedPointData?.address,
                };
                sessionStorage.setItem('deliveryData', JSON.stringify(deliveryData));

                // Переходим к финальной странице
                router.push('/request/final');
            } else {
                console.error('❌ Ошибка API:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ Текст ошибки:', errorText);
            }
        } catch (error) {
            console.error('Ошибка при сохранении выбора:', error);
            // В случае ошибки разблокируем кнопки
            setSubmitting(false);
            setButtonsDisabled(false);
        } finally {
            // Не сбрасываем состояния при успешном переходе
            // setSubmitting(false);
        }
    };

    const finalPrice = price || 48000;

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

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
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
                                Наши точки приема
                            </h2>
                            <p className="text-apple-body text-gray-600 font-sf-pro">
                                Выберите удобную для вас точку или измените способ доставки
                            </p>
                        </motion.div>

                        {/* Краткая информация о заявке */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-apple-xl p-4 border border-gray-200 shadow-sm backdrop-blur-apple"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-apple-body text-gray-600 font-sf-pro">Ваше устройство:</p>
                                <p className="font-semibold text-gray-900 font-sf-pro">{getFullModelName()}</p>
                                <p className="text-apple-body text-gray-600 font-sf-pro">Предварительная цена: <span className="text-xl font-bold text-green-600">{finalPrice.toLocaleString()} ₽</span></p>
                            </div>
                        </motion.div>

                        {/* Точки самовывоза */}
                        <div className="space-y-4 flex-1 overflow-auto min-h-0 h-full w-full p-4 pb-20">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Image
                                        src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                                        alt="Загрузка точек"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                            ) : !Array.isArray(pickupPoints) || pickupPoints.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    Точки приема не найдены
                                </div>
                            ) : (
                                pickupPoints.map((point) => {
                                    const isSelected = selectedPoint === point.id;
                                    return (
                                        <div
                                            key={point.id}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${isSelected
                                                ? 'border-teal-500 bg-teal-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handlePointSelect(point.id)}
                                                className="flex-1 text-left"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-lg">📍</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 text-apple-title font-sf-pro">{point.name}</h3>
                                                            <p className="text-apple-body text-gray-600 font-sf-pro">{point.address}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm">🕒</span>
                                                            <span className="text-apple-body text-gray-600 font-sf-pro">Режим работы: {point.workingHours}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                            <div className="mx-3 self-stretch w-px bg-gray-200" aria-hidden />
                                            <Button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={!isSelected || submitting || buttonsDisabled}
                                                className={`flex items-center justify-center rounded-lg w-12 h-12 transition-colors ${isSelected ? 'bg-teal-500 text-white hover:bg-teal-600 animate-pulse' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                style={{ animationDuration: isSelected ? '0.8s' as any : undefined }}
                                                aria-label="Далее"
                                                title={isSelected ? 'Далее' : 'Сначала выберите адрес'}
                                            >
                                                ➔
                                            </Button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default PickupPointsPage;
