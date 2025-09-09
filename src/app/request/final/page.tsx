'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

const FinalPage = () => {
    const router = useRouter();
    const { telegramId, modelname, price, resetAllStates, setCurrentStep } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [userTelegramId, setUserTelegramId] = useState('');
    const [telegramIdConfirmed, setTelegramIdConfirmed] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState('');
    const [showThankYou, setShowThankYou] = useState(false);

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
            console.log('🔍 Final page - загружаем telegramId:', {
                telegramIdFromStore: telegramId,
                sessionStorageKeys: Object.keys(sessionStorage),
                telegramWebApp: !!window.Telegram?.WebApp,
                userData: window.Telegram?.WebApp?.initDataUnsafe?.user
            });

            // Сначала пытаемся получить из Zustand store
            if (telegramId) {
                console.log('✅ Loading telegramId from store:', telegramId);
                setUserTelegramId(telegramId);
                setTelegramUsername(telegramId);
                return;
            }

            // Если нет в store, пытаемся получить из sessionStorage
            const savedTelegramId = sessionStorage.getItem('telegramId');
            console.log('🔍 Loading telegramId from sessionStorage:', savedTelegramId);

            if (savedTelegramId) {
                console.log('✅ Set telegramId from sessionStorage:', savedTelegramId);
                setUserTelegramId(savedTelegramId);
                setTelegramUsername(savedTelegramId);
            } else {
                console.log('❌ No telegramId found in sessionStorage');

                // Пытаемся получить username напрямую из Telegram WebApp
                if (window.Telegram?.WebApp?.initDataUnsafe?.user?.username) {
                    const telegramUsername = window.Telegram.WebApp.initDataUnsafe.user.username;
                    console.log('✅ Found telegram username from WebApp:', telegramUsername);
                    setTelegramUsername(telegramUsername);
                    setUserTelegramId(`@${telegramUsername}`);
                    // Сохраняем для будущего использования
                    sessionStorage.setItem('telegramUsername', telegramUsername);
                } else {
                    console.log('❌ No telegram username found in WebApp either');

                    // Fallback для тестирования в браузере
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔄 Using fallback telegramId for development');
                        setTelegramUsername('qoqos_app');
                        setUserTelegramId('@qoqos_app');
                        sessionStorage.setItem('telegramUsername', 'qoqos_app');
                    }
                }
            }
        }
    }, [telegramId]);

    // Загружаем данные о выборе доставки из sessionStorage или БД
    const [deliveryData, setDeliveryData] = useState<any>(null);

    useEffect(() => {
        const loadDeliveryData = async () => {
            if (typeof window !== 'undefined') {
                const savedDeliveryData = sessionStorage.getItem('deliveryData');
                console.log('🔍 Loading delivery data from sessionStorage:', savedDeliveryData);
                
                if (savedDeliveryData) {
                    try {
                        const parsed = JSON.parse(savedDeliveryData);
                        setDeliveryData(parsed);
                        console.log('✅ Delivery data loaded from sessionStorage:', parsed);
                    } catch (e) {
                        console.error('Error parsing delivery data:', e);
                    }
                } else {
                    // Если нет данных в sessionStorage, пытаемся получить из БД
                    console.log('⚠️ No delivery data in sessionStorage, trying to load from DB');
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
                            console.log('📦 Draft data from DB:', data);
                            
                            if (data.draft) {
                                const draftDeliveryData = {
                                    deliveryMethod: 'pickup',
                                    pickupPoint: data.draft.pickupPoint || 'Адрес не указан',
                                };
                                setDeliveryData(draftDeliveryData);
                                console.log('✅ Delivery data loaded from DB:', draftDeliveryData);
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
                modelname: getFullModelName(),
                price: finalPrice,
                deliveryData,
            };
            
            console.log('📤 Final submit - отправляемые данные:', requestData);
            console.log('🔍 Final submit - проверка полей:', {
                telegramId: !!requestData.telegramId,
                userTelegramId: !!requestData.userTelegramId,
                modelname: !!requestData.modelname,
                price: !!requestData.price,
                deliveryData: !!requestData.deliveryData,
            });
            
            const response = await fetch('/api/request/submit-final', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Final submit - ответ от API:', result);
                setTelegramIdConfirmed(true);
                setShowThankYou(true);

                // Переходим на главную страницу через 3 секунды
                setTimeout(() => {
                    router.push('/');

                    // Очищаем данные
                    setTimeout(() => {
                        if (typeof window !== 'undefined') {
                            // Очищаем все данные заявки
                            sessionStorage.removeItem('phoneSelection');
                            sessionStorage.removeItem('deviceConditions');
                            sessionStorage.removeItem('additionalConditions');
                            sessionStorage.removeItem('imei');
                            sessionStorage.removeItem('serialNumber');
                            sessionStorage.removeItem('deliveryData');
                            sessionStorage.removeItem('deliveryOptionsData');
                            sessionStorage.removeItem('pickupPointsData');
                            sessionStorage.removeItem('courierBookingData');
                            sessionStorage.setItem('requestSubmitted', 'true');
                        }
                        resetAllStates();
                    }, 100);
                }, 3000);
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

    const getDeliveryInfo = () => {
        if (!deliveryData) return null;

        if (deliveryData.deliveryMethod === 'pickup') {
            return {
                method: 'Личная доставка',
                details: deliveryData.pickupPoint
            };
        } else if (deliveryData.deliveryMethod === 'courier') {
            return {
                method: 'Мастер',
                details: `${deliveryData.courierAddress} - ${new Date(deliveryData.courierDate).toLocaleDateString('ru-RU')} в ${deliveryData.courierTime}`
            };
        }

        return null;
    };

    const deliveryInfo = getDeliveryInfo();

    if (submitted) {
        return (
            <Page back={false}>
                <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col request-page">
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
                            <p className="text-gray-600 mb-4">
                                Ваша заявка успешно отправлена.
                            </p>
                            <p className="text-gray-600 mb-6">
                                📞 Менеджер свяжется с вами для уточнения деталей и подтверждения времени.
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
                <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col request-page">
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
                                className="w-full mx-auto mb-6 flex items-center justify-center"
                            >
                                <Image
                                    src={getPictureUrl('logo_bye.png') || '/logo_bye.png'}
                                    alt="До свидания"
                                    width={400}
                                    height={200}
                                    className="w-full h-auto object-contain rounded-2xl shadow-lg"
                                />
                            </motion.div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Спасибо за использование нашего сервиса!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Ваша заявка успешно отправлена.
                            </p>
                            <p className="text-gray-600 mb-6">
                                📞 Менеджер свяжется с вами для уточнения деталей и подтверждения времени.
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

    return (
        <Page back={true}>
            <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col request-page">
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
                                    <h3 className="font-semibold text-gray-900 mb-2">Предварительная цена:</h3>
                                    <p className="text-2xl font-bold text-green-600">{finalPrice.toLocaleString()} ₽</p>
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
                                            ? `Мы получили ваш Telegram ID: ${telegramUsername}. Вы можете изменить его при необходимости.`
                                            : 'Введите ваш Telegram ID для связи'
                                        }
                                    </p>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">@</span>
                                        <input
                                            type="text"
                                            value={userTelegramId}
                                            onChange={(e) => setUserTelegramId(e.target.value)}
                                            placeholder="username или 123456789"
                                            className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-sm"
                                        />
                                    </div>

                                    {telegramUsername && userTelegramId !== telegramUsername && (
                                        <Button
                                            onClick={() => setUserTelegramId(telegramUsername)}
                                            variant="outline"
                                            className="w-full mt-3 text-sm py-2 border-[#2dc2c6] text-[#2dc2c6] hover:bg-[#2dc2c6] hover:text-white"
                                        >
                                            Использовать данные из Telegram
                                        </Button>
                                    )}
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
