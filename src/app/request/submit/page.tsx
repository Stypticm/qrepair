'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

const SubmitPage = () => {
    const router = useRouter();
    const { telegramId, username, modelname, deviceConditions, additionalConditions, price, resetAllStates, setDeviceConditions, setModel, setAdditionalConditions, imei, serialNumber, setImei, setSerialNumber, setPrice, setCurrentStep } = useAppStore();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [priceLoaded, setPriceLoaded] = useState(false);
    const [dbData, setDbData] = useState<any>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState('');
    const [customFeedback, setCustomFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [agreeLoading, setAgreeLoading] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('submit');
    }, [setCurrentStep]);

    // Загружаем данные из sessionStorage при монтировании
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Загружаем выбор телефона
            const savedPhoneSelection = sessionStorage.getItem('phoneSelection');
            if (savedPhoneSelection) {
                try {
                    const parsed = JSON.parse(savedPhoneSelection);
                    if (parsed.model) {
                        setModel(parsed.model);
                    }
                } catch (e) {
                    // Ошибка парсинга phoneSelection
                }
            }

            // Загружаем состояния устройства
            const savedDeviceConditions = sessionStorage.getItem('deviceConditions');
            if (savedDeviceConditions) {
                try {
                    const parsed = JSON.parse(savedDeviceConditions);
                    if (parsed && (parsed.front || parsed.back || parsed.side)) {
                        setDeviceConditions(parsed);
                    }
                } catch (e) {
                    // Ошибка парсинга deviceConditions
                }
            }

            // Загружаем дополнительные состояния
            const savedAdditionalConditions = sessionStorage.getItem('additionalConditions');
            if (savedAdditionalConditions) {
                try {
                    const parsed = JSON.parse(savedAdditionalConditions);
                    if (parsed && (parsed.faceId || parsed.touchId || parsed.backCamera || parsed.battery)) {
                        setAdditionalConditions(parsed);
                    }
                } catch (e) {
                    // Ошибка парсинга additionalConditions
                }
            }

            // Загружаем IMEI
            const savedImei = sessionStorage.getItem('imei');
            if (savedImei) {
                setImei(savedImei);
            }

            // Загружаем S/N
            const savedSerialNumber = sessionStorage.getItem('serialNumber');
            if (savedSerialNumber) {
                setSerialNumber(savedSerialNumber);
            }

            // Загружаем цену из sessionStorage
            const savedPrice = sessionStorage.getItem('price');
            if (savedPrice) {
                try {
                    const priceValue = JSON.parse(savedPrice);
                    if (priceValue && priceValue > 0) {
                        setPrice(priceValue);
                        setPriceLoaded(true);
                    } else {
                    }
                } catch (e) {
                }
            }

            // Если нет данных в sessionStorage, загружаем из БД
            const hasSessionData = savedPhoneSelection || savedDeviceConditions || savedAdditionalConditions || savedImei || savedSerialNumber;
            
            // Проверяем, есть ли валидная цена в sessionStorage
            let hasValidPrice = false;
            if (savedPrice) {
                try {
                    const priceValue = JSON.parse(savedPrice);
                    hasValidPrice = priceValue && priceValue > 0;
                } catch (e) {
                    hasValidPrice = false;
                }
            }
            
                hasSessionData,
                hasValidPrice,
                savedPrice,
                telegramId: !!telegramId
            });

            if ((!hasSessionData || !hasValidPrice) && telegramId) {
                // Загружаем данные из БД
                fetch('/api/request/getDraft', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ telegramId }),
                })
                    .then(response => response.ok ? response.json() : null)
                    .then(data => {
                        if (data) {
                                basePrice: data.basePrice,
                                damagePercent: data.damagePercent,
                                finalPrice: data.price,
                                calculatedPrice: data.basePrice * (1 - (data.damagePercent || 0) / 100)
                            });

                            // Сохраняем данные для отображения
                            setDbData(data);

                            if (data.modelname) setModel(data.modelname);
                            if (data.price) {
                                setPrice(data.price);
                                setPriceLoaded(true);
                                // Обновляем цену в sessionStorage
                                if (typeof window !== 'undefined') {
                                    sessionStorage.setItem('price', JSON.stringify(data.price));
                                }
                            }
                            if (data.deviceConditions) setDeviceConditions(data.deviceConditions);
                            if (data.additionalConditions) setAdditionalConditions(data.additionalConditions);
                            if (data.imei) setImei(data.imei);
                            if (data.sn) setSerialNumber(data.sn);
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка загрузки данных из БД:', error);
                    });
            }
        }
    }, [setModel, setPrice, setDeviceConditions, setAdditionalConditions, setImei, setSerialNumber, telegramId]);

    // Проверяем, загружены ли все необходимые данные
    useEffect(() => {
        // Проверяем наличие основных данных
        const hasBasicData = modelname && telegramId;

        // Проверяем наличие данных о состояниях устройства
        const hasDeviceData = deviceConditions && (
            deviceConditions.front ||
            deviceConditions.back ||
            deviceConditions.side
        );

        // Проверяем наличие дополнительных данных
        const hasAdditionalData = additionalConditions && (
            additionalConditions.faceId ||
            additionalConditions.touchId ||
            additionalConditions.backCamera ||
            additionalConditions.battery
        );

        // Данные считаются загруженными, если есть основная модель и хотя бы какие-то данные о состояниях
        if (hasBasicData && (hasDeviceData || hasAdditionalData)) {
            setDataLoaded(true);
        }

        // Добавляем таймаут для предотвращения зависания
        const timeout = setTimeout(() => {
            if (!dataLoaded) {
                setDataLoaded(true);
            }
        }, 5000); // 5 секунд

        return () => clearTimeout(timeout);
    }, [modelname, telegramId, deviceConditions, additionalConditions, dataLoaded]);

    const handleReset = async () => {
        try {

            // Сбрасываем все состояния
            resetAllStates();

            // Сбрасываем навигацию
            setCurrentStep(null);

            // Сбрасываем состояние загрузки данных
            setDataLoaded(false);

            // Очищаем sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.clear();
            }

            // Очищаем данные в базе данных
            if (telegramId) {
                try {
                    const response = await fetch('/api/request/clearDraft', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ telegramId }),
                    });


                    if (!response.ok) {
                        const errorData = await response.text();
                        console.error('Ошибка очистки данных в БД:', response.status, errorData);
                    } else {
                        const result = await response.json();
                    }
                } catch (fetchError) {
                    console.error('Ошибка при запросе к API clearDraft:', fetchError);
                }
            } else {
                console.warn('No telegramId available for clearing draft');
            }

            // Переходим к device-info (первая страница в новой структуре)
            router.replace('/request/device-info');
        } catch (error) {
            console.error('Ошибка при сбросе данных:', error);
            // В случае ошибки всё равно переходим к device-info
            router.replace('/request/device-info');
        }
    };

    const handleAgree = async () => {
        // Блокируем кнопки сразу при нажатии
        setButtonsDisabled(true);
        setAgreeLoading(true);

        try {
            // Сохраняем текущий шаг в БД перед переходом
            if (telegramId) {
                await fetch('/api/request/saveCurrentStep', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        currentStep: 'delivery-options',
                    }),
                });
            }

            // Переходим к выбору способа доставки
            router.push('/request/delivery-options');
        } catch (error) {
            console.error('Error saving current step:', error);
            // Переходим даже при ошибке
            router.push('/request/delivery-options');
        } finally {
            // Не сбрасываем состояния, так как происходит переход
            // setAgreeLoading(false);
            // setButtonsDisabled(false);
        }
    };

    const handleDisagree = () => {
        // Блокируем кнопки сразу при нажатии
        setButtonsDisabled(true);
        setShowFeedbackDialog(true);
    };

    const handleFeedbackSubmit = async () => {
        const finalFeedback = selectedFeedback === 'Другое' ? customFeedback.trim() : selectedFeedback;
        if (!finalFeedback) return;

        setSubmitting(true);
        try {
            // Сохраняем feedback в БД
            const response = await fetch('/api/request/submit-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    username,
                    feedback: finalFeedback,
                    modelname: getFullModelName(),
                    price: finalPrice,
                }),
            });

            if (response.ok) {
                // Переходим на главную страницу
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
            }
        } catch (error) {
            console.error('Ошибка при отправке feedback:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Используем цену из контекста или цену по умолчанию
    const finalPrice = price || 0;

    // Функция для формирования полной модели из данных sessionStorage
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

        // Возвращаем базовую модель если не удалось получить полную
        const cleanModelName = modelname ? modelname.replace(/^Apple\s+/, '') : 'Модель не найдена';
        return cleanModelName;
    };

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-y-auto">
                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-4 pb-4">
                        {!dataLoaded ? (
                            <div className="w-full max-w-md text-center">
                                <Image
                                    src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                                    alt="Загрузка данных"
                                    width={48}
                                    height={48}
                                    className="object-contain mx-auto mb-4"
                                />
                                <p className="text-gray-600">Загружаем данные заявки...</p>
                            </div>
                        ) : !modelname ? (
                            <div className="w-full max-w-md text-center">
                                <p className="text-red-600">Ошибка: данные заявки не найдены</p>
                                <Button
                                    onClick={() => router.push('/request/form')}
                                    className="mt-4 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white"
                                >
                                    Вернуться к форме
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Summary заявки */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                                >
                                    <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">
                                        Предварительная оценка
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <span className="font-semibold text-gray-900 break-words text-lg">{getFullModelName()}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-900">Предварительная цена:</span>
                                                {priceLoaded ? (
                                                    <span className="font-bold text-2xl text-green-600">{finalPrice.toLocaleString()} ₽</span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                                        <span className="text-gray-500">Загрузка...</span>
                                                    </div>
                                                )}
                                            </div>
                                            {priceLoaded && finalPrice > 0 && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span>Цена с учетом состояния устройства</span>
                                                    {dbData && dbData.damagePercent > 0 && (
                                                        <div className="mt-1 text-xs text-orange-600">
                                                            Скидка: {dbData.damagePercent.toFixed(1)}% (базовая цена: {dbData.basePrice?.toLocaleString()} ₽)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Кнопки согласия */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="w-full flex flex-col gap-3"
                                >
                                    <Button
                                        onClick={handleAgree}
                                        disabled={agreeLoading || buttonsDisabled}
                                        className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg shadow-md disabled:opacity-50"
                                    >
                                        {agreeLoading ? 'Переходим...' : 'Согласен'}
                                    </Button>

                                    <Button
                                        onClick={handleDisagree}
                                        disabled={buttonsDisabled}
                                        variant="outline"
                                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium text-lg py-4 rounded-2xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                    >
                                        Не согласен
                                    </Button>
                                </motion.div>

                                {/* Кнопка "Начать заново" */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <Button
                                        onClick={() => setShowResetDialog(true)}
                                        variant="outline"
                                        className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium text-base py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        Начать заново
                                    </Button>
                                </motion.div>

                                {/* Подпись о цене */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="text-center"
                                >
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        * Цена может быть изменена при вторичном осмотре устройства нашим специалистом
                                    </p>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Диалог подтверждения сброса */}
            {showResetDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Начать заново?
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Все введенные данные будут удалены. Это действие нельзя отменить.
                            </p>
                            <div className="flex space-x-3 gap-2">
                                <Button
                                    onClick={() => setShowResetDialog(false)}
                                    variant="outline"
                                    className="flex-1 py-2 text-sm"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowResetDialog(false);
                                        handleReset();
                                    }}
                                    className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Да, начать заново
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Диалог для feedback */}
            {showFeedbackDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Что вас не устроило?
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Поделитесь своими мыслями, чтобы мы могли улучшить наш сервис
                            </p>


                            <div className="flex flex-col gap-2">
                                <label className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer gap-2">
                                    <input
                                        type="radio"
                                        name="feedback"
                                        value="Не устроила цена выкупа"
                                        checked={selectedFeedback === 'Не устроила цена выкупа'}
                                        onChange={(e) => setSelectedFeedback(e.target.value)}
                                        className="w-4 h-4 text-[#2dc2c6] focus:ring-[#2dc2c6]"
                                    />
                                    <span className="text-sm text-gray-700">Не устроила цена выкупа</span>
                                </label>

                                <label className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer gap-2">
                                    <input
                                        type="radio"
                                        name="feedback"
                                        value="Не устроил адрес доставки"
                                        checked={selectedFeedback === 'Не устроил адрес доставки'}
                                        onChange={(e) => setSelectedFeedback(e.target.value)}
                                        className="w-4 h-4 text-[#2dc2c6] focus:ring-[#2dc2c6]"
                                    />
                                    <span className="text-sm text-gray-700">Не устроил адрес доставки</span>
                                </label>

                                <label className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer gap-2">
                                    <input
                                        type="radio"
                                        name="feedback"
                                        value="Просто хотел узнать цену своего телефона"
                                        checked={selectedFeedback === 'Просто хотел узнать цену своего телефона'}
                                        onChange={(e) => setSelectedFeedback(e.target.value)}
                                        className="w-4 h-4 text-[#2dc2c6] focus:ring-[#2dc2c6]"
                                    />
                                    <span className="text-sm text-gray-700">Хотел узнать цену своего телефона</span>
                                </label>

                                <label className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer gap-2">
                                    <input
                                        type="radio"
                                        name="feedback"
                                        value="Другое"
                                        checked={selectedFeedback === 'Другое'}
                                        onChange={(e) => setSelectedFeedback(e.target.value)}
                                        className="w-4 h-4 text-[#2dc2c6] focus:ring-[#2dc2c6]"
                                    />
                                    <span className="text-sm text-gray-700">Другое</span>
                                </label>
                            </div>

                            {selectedFeedback === 'Другое' && (
                                <textarea
                                    value={customFeedback}
                                    onChange={(e) => setCustomFeedback(e.target.value)}
                                    placeholder="Опишите, что вас не устроило..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-sm resize-none"
                                    rows={3}
                                />
                            )}
                        </div>

                        <div className="flex space-x-3 gap-2 mt-4">
                                                         <Button
                                 onClick={() => {
                                     setShowFeedbackDialog(false);
                                     setSelectedFeedback('');
                                     setCustomFeedback('');
                                     setButtonsDisabled(false); // Разблокируем кнопки при отмене
                                 }}
                                 disabled={submitting}
                                 variant="outline"
                                 className="flex-1 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 Отмена
                             </Button>
                            <Button
                                onClick={handleFeedbackSubmit}
                                disabled={!selectedFeedback || (selectedFeedback === 'Другое' && !customFeedback.trim()) || submitting}
                                className="flex-1 py-2 text-sm bg-[#2dc2c6] hover:bg-[#25a8ac] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Отправляем...' : 'Отправить'}
                            </Button>
                        </div>
                    </div>
                </div>

            )}
        </Page>
    );
};

export default SubmitPage;
