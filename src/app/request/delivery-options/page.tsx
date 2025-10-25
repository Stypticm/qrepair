'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';

// iPhone-специфичные размеры экранов
const IPHONE_BREAKPOINTS = {
  mini: { width: 375, height: 812 }, // iPhone 12/13 mini
  standard: { width: 390, height: 844 }, // iPhone 12/13/14
  plus: { width: 428, height: 926 }, // iPhone 12/13/14 Pro Max
  pro: { width: 393, height: 852 }, // iPhone 14 Pro
} as const;

// Функция для определения размера экрана iPhone
const getIPhoneScreenSize = () => {
  if (typeof window === 'undefined') return 'standard';
  
  const { innerWidth, innerHeight } = window;
  
  // Определяем по ширине экрана
  if (innerWidth <= 375) return 'mini';
  if (innerWidth <= 390) return 'standard';
  if (innerWidth <= 393) return 'pro';
  return 'plus';
};

const DeliveryOptionsPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price, setCurrentStep } = useAppStore();
    const [selectedOption, setSelectedOption] = useState<'pickup' | 'courier' | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number; midpoint: number } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [screenSize, setScreenSize] = useState<'mini' | 'standard' | 'pro' | 'plus'>('standard');

    // Определяем размер экрана iPhone
    useEffect(() => {
        const updateScreenSize = () => {
            setScreenSize(getIPhoneScreenSize());
        };
        
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    // Адаптивные размеры для разных iPhone
    const adaptiveStyles = useMemo(() => {
        const baseStyles = {
            buttonHeight: 'h-20',
            iconSize: 'w-12 h-12',
            textSize: 'text-xl',
            subTextSize: 'text-sm',
            spacing: 'space-x-4',
            gap: 'gap-4'
        };

        switch (screenSize) {
            case 'mini':
                return {
                    ...baseStyles,
                    buttonHeight: 'h-18',
                    iconSize: 'w-10 h-10',
                    textSize: 'text-base', // Уменьшил с text-lg
                    subTextSize: 'text-xs',
                    spacing: 'space-x-4', // Увеличил отступ от иконки
                    gap: 'gap-3'
                };
            case 'plus':
                return {
                    ...baseStyles,
                    buttonHeight: 'h-22',
                    iconSize: 'w-14 h-14',
                    textSize: 'text-lg', // Уменьшил с text-2xl
                    subTextSize: 'text-sm', // Уменьшил с text-base
                    spacing: 'space-x-6', // Увеличил отступ от иконки
                    gap: 'gap-5'
                };
            default:
                return {
                    ...baseStyles,
                    textSize: 'text-base', // Уменьшил с text-xl
                    spacing: 'space-x-5', // Увеличил отступ от иконки
                };
        }
    }, [screenSize]);

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

    const handleCourier = () => {
        setSelectedOption('courier');
        setIsNavigating(true);
        // TODO: Переход на страницу выбора курьера
        setTimeout(() => router.push('/request/courier'), 200);
    };

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
                                Способ передачи
                            </h2>
                            <p className="text-gray-600">
                                Выберите удобный способ передачи устройства
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

                        {/* Кнопки выбора способа доставки - iPhone-адаптивные */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={`w-full flex flex-col ${adaptiveStyles.gap}`}
                        >
                            {/* Курьер - Unified Apple Button */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                            >
                                <Button
                                    onClick={handleCourier}
                                    className={`w-full ${adaptiveStyles.buttonHeight} bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-3xl font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 overflow-hidden relative group`}
                                >
                                    {/* Apple-style inner shadow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-3xl" />
                                    
                                    <div className={`flex items-center justify-center ${adaptiveStyles.spacing} relative z-10`}>
                                        <div className={`${adaptiveStyles.iconSize} bg-gray-100 rounded-2xl flex items-center justify-center mr-1`}>
                                            <span className={`${screenSize === 'plus' ? 'text-3xl' : screenSize === 'mini' ? 'text-xl' : 'text-2xl'}`}>🚚</span>
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-bold ${adaptiveStyles.textSize}`}>Курьер заберет</div>
                                            <div className={`${adaptiveStyles.subTextSize} opacity-70 font-medium`}>Курьер заберет устройство</div>
                                        </div>
                                    </div>
                                    
                                    {/* Apple-style shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </Button>
                            </motion.div>

                            {/* Самовывоз - Unified Apple Button */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
                            >
                                <Button
                                    onClick={handlePickup}
                                    className={`w-full ${adaptiveStyles.buttonHeight} bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-3xl font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 overflow-hidden relative group`}
                                >
                                    {/* Apple-style inner shadow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-3xl" />
                                    
                                    <div className={`flex items-center justify-center ${adaptiveStyles.spacing} relative z-10`}>
                                        <div className={`${adaptiveStyles.iconSize} bg-gray-100 rounded-2xl flex items-center justify-center mr-1`}>
                                            <span className={`${screenSize === 'plus' ? 'text-3xl' : screenSize === 'mini' ? 'text-xl' : 'text-2xl'}`}>🏪</span>
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-bold ${adaptiveStyles.textSize}`}>Привезу сам</div>
                                            <div className={`${adaptiveStyles.subTextSize} opacity-70 font-medium`}>Сам привезу на точку</div>
                                        </div>
                                    </div>
                                    
                                    {/* Apple-style shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <img src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">
                            {selectedOption === 'courier' ? 'Настраиваем курьера…' : 'Открываем точки самовывоза…'}
                        </p>
                    </div>
                </div>
            )}
        </Page>
    );
};

export default DeliveryOptionsPage;
