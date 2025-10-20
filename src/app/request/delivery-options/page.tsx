'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';

const DeliveryOptionsPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price, setCurrentStep } = useAppStore();
    const [selectedOption, setSelectedOption] = useState<'pickup' | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number; midpoint: number } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

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
            const savedPriceRange = sessionStorage.getItem('priceRange');
            if (savedPriceRange) {
                try {
                    const parsed = JSON.parse(savedPriceRange);
                    if (parsed && typeof parsed.min === 'number' && typeof parsed.max === 'number') {
                        setPriceRange(parsed);
                    }
                } catch (e) {
                    console.error('Ошибка при восстановлении priceRange:', e);
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
        setIsNavigating(true);
        setTimeout(() => router.push('/request/pickup-points'), 200);
    };

    const finalPrice = price || priceRange?.midpoint || 48000;
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

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
                        {/* Заголовок */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Передача устройства
                            </h2>
                            <p className="text-gray-600">
                                Привезите устройство в одну из наших точек
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
                                <p className="text-base text-gray-700">Ваше устройство:</p>
                                <p className="text-xl font-semibold text-gray-900">{getFullModelName()}</p>
                                <p className="text-lg text-gray-700">Диапазон цены: {formattedRange ? (
                                    <span className="font-semibold text-green-600">{formattedRange}</span>
                                ) : (
                                    <span className="text-gray-500">уточняется</span>
                                )}
                                </p>
                            </div>
                        </motion.div>

                        {/* Кнопка перехода к выбору точки */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Button
                                onClick={handlePickup}
                                className="w-full bg-[#2dc2c6] hover:bg-[#2dc2c6]/90 text-white py-4 rounded-2xl text-lg font-medium shadow-sm"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <span className="text-2xl">🏪</span>
                                    <span>Выбрать точку самовывоза</span>
                                </div>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <img src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Открываем точки самовывоза…</p>
                    </div>
                </div>
            )}
        </Page>
    );
};

export default DeliveryOptionsPage;
