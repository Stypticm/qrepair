'use client'

import { useState, useEffect } from 'react'
import { useAppStore, useUserData, useDeviceData, useNavigation } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';

const PickupPointsPage = () => {
    const router = useRouter();
    const { telegramId } = useUserData();
    const { modelname, price } = useDeviceData();
    const { setCurrentStep } = useNavigation();
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

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

    // Точки приема
    const pickupPoints = [
        {
            id: 'point1',
            name: 'Центр города',
            address: 'ул. Тверская, 15',
            workingHours: '10:00 - 22:00',
            description: 'Рядом с метро Тверская'
        },
        {
            id: 'point2',
            name: 'Торговый центр "Мега"',
            address: 'Ходынский бул., 4',
            workingHours: '10:00 - 22:00',
            description: '2 этаж, рядом с фуд-кортом'
        }
    ];

    const handlePointSelect = (pointId: string) => {
        setSelectedPoint(pointId);
    };

    const handleSubmit = async () => {
        if (!selectedPoint) return;

        // Блокируем кнопки сразу при нажатии
        setButtonsDisabled(true);
        setSubmitting(true);
        try {
            const selectedPointData = pickupPoints.find(p => p.id === selectedPoint);
            
            // Сохраняем выбор в БД
            const response = await fetch('/api/request/submit-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    modelname: getFullModelName(),
                    price: finalPrice,
                    deliveryMethod: 'pickup',
                    pickupPoint: selectedPointData?.name,
                }),
            });

            if (response.ok) {
                // Сохраняем данные о доставке в sessionStorage
                const deliveryData = {
                    deliveryMethod: 'pickup',
                    pickupPoint: selectedPointData?.name,
                };
                sessionStorage.setItem('deliveryData', JSON.stringify(deliveryData));
                
                // Переходим к финальной странице
                router.push('/request/final');
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
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4">
                        {/* Заголовок */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                                                    <h2 className="text-apple-title text-gray-900 mb-2 font-sf-pro">
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
                                <p className="text-apple-body text-gray-600 font-sf-pro">Предварительная цена: <span className="font-semibold text-green-600">{finalPrice.toLocaleString()} ₽</span></p>
                            </div>
                        </motion.div>

                        {/* Точки самовывоза */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {pickupPoints.map((point, index) => (
                                <motion.div
                                    key={point.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                    onClick={() => handlePointSelect(point.id)}
                                    className={`p-4 rounded-apple-xl border-2 transition-all duration-200 cursor-pointer ${
                                        selectedPoint === point.id 
                                            ? 'border-teal-500 bg-teal-50' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                    }`}
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
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">ℹ️</span>
                                                <span className="text-apple-body text-gray-600 font-sf-pro">{point.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Кнопки */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3 flex flex-col gap-2"
                        >
                            {/* Кнопка изменения способа доставки */}
                            <Button
                                onClick={() => {
                                    // Очищаем данные самовывоза при смене способа доставки
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.removeItem('pickupPointsData');
                                    }
                                    router.push('/request/courier-booking');
                                }}
                                variant="outline"
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-sf-pro text-apple-button py-3 rounded-apple-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Вызвать мастера
                            </Button>

                            {/* Кнопка подтверждения */}
                            {selectedPoint && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || buttonsDisabled}
                                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-sf-pro text-apple-button py-4 rounded-apple-xl transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50"
                                >
                                    {submitting ? 'Сохраняем...' : 'Выбрать эту точку'}
                                </Button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default PickupPointsPage;
