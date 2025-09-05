'use client'

import { useState, useEffect } from 'react'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useNavigation } from '@/components/NavigationContext/NavigationContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';

const DeliveryOptionsPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price } = useStartForm();
    const { setCurrentStep } = useNavigation();
    const [selectedOption, setSelectedOption] = useState<'pickup' | 'courier' | null>(null);

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('delivery-options');
        // Убираем дублирующий API запрос - он уже выполняется на предыдущей странице
    }, [setCurrentStep]);

    // Восстанавливаем состояние из sessionStorage при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDeliveryOptions = sessionStorage.getItem('deliveryOptionsData');
            if (savedDeliveryOptions) {
                try {
                    const parsed = JSON.parse(savedDeliveryOptions);
                    if (parsed.selectedOption) setSelectedOption(parsed.selectedOption);
                } catch (e) {
                    console.error('Ошибка при восстановлении данных выбора доставки:', e);
                    sessionStorage.removeItem('deliveryOptionsData');
                }
            }
        }
    }, []);

    // Сохраняем состояние в sessionStorage при изменениях
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedOption) {
            const deliveryOptionsData = { selectedOption };
            sessionStorage.setItem('deliveryOptionsData', JSON.stringify(deliveryOptionsData));
        }
    }, [selectedOption]);

    const handlePickup = () => {
        setSelectedOption('pickup');
        // Очищаем данные курьера при выборе самовывоза
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('courierBookingData');
        }
        // Переходим к выбору точки самовывоза
        router.push('/request/pickup-points');
    };

    const handleCourier = () => {
        setSelectedOption('courier');
        // Очищаем данные самовывоза при выборе курьера
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pickupPointsData');
        }
        // Переходим к выбору адреса и времени для мастера
        router.push('/request/courier-booking');
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Как вы хотите передать устройство?
                            </h2>
                            <p className="text-gray-600">
                                Выберите удобный для вас способ
                            </p>
                        </motion.div>

                        {/* Краткая информация о заявке */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">Ваше устройство:</p>
                                <p className="font-semibold text-gray-900">{getFullModelName()}</p>
                                <p className="text-sm text-gray-600">Предварительная цена: <span className="font-semibold text-green-600">{finalPrice.toLocaleString()} ₽</span></p>
                            </div>
                        </motion.div>

                        {/* Варианты доставки */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Личная доставка */}
                            <div 
                                onClick={handlePickup}
                                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                                    selectedOption === 'pickup' 
                                        ? 'border-[#2dc2c6] bg-[#2dc2c6]/5' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🏪</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Привезу сам</h3>
                                        <p className="text-sm text-gray-600">Привезите устройство в одну из наших точек</p>
                                    </div>
                                </div>
                            </div>

                            {/* Курьер */}
                            <div 
                                onClick={handleCourier}
                                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                                    selectedOption === 'courier' 
                                        ? 'border-[#2dc2c6] bg-[#2dc2c6]/5' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🚚</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">Вызвать мастера</h3>
                                        <p className="text-sm text-gray-600">Мастер заберет устройство по вашему адресу</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default DeliveryOptionsPage;
