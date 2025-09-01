'use client'

import { useState, useEffect } from 'react'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';



const SubmitPage = () => {
    const router = useRouter();
    const { telegramId, modelname, deviceConditions, additionalConditions, price, resetAllStates, setDeviceConditions } = useStartForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Принудительно закрываем любые открытые диалоговые окна при загрузке страницы
    useEffect(() => {
        // Закрываем все возможные диалоговые окна
        const dialogs = document.querySelectorAll('[role="dialog"]');
        dialogs.forEach(dialog => {
            if (dialog instanceof HTMLElement) {
                dialog.style.display = 'none';
            }
        });
        
        // Также закрываем элементы с классом dialog
        const dialogElements = document.querySelectorAll('.dialog, [class*="dialog"]');
        dialogElements.forEach(element => {
            if (element instanceof HTMLElement) {
                element.style.display = 'none';
            }
        });
        
        // Убираем backdrop (серый фон)
        const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
        backdrops.forEach(backdrop => {
            if (backdrop instanceof HTMLElement) {
                backdrop.style.display = 'none';
            }
        });
    }, []);

    // Проверяем, загружены ли все необходимые данные
    useEffect(() => {
        // Если заявка уже отправлена, не проверяем данные
        if (submitted) return;
        
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
    }, [modelname, telegramId, deviceConditions, additionalConditions, submitted]);


    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const res = await fetch('/api/request/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    modelname,
                    price: finalPrice,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Заявка отправлена успешно:', result);
                
                // Сразу помечаем как отправленную, чтобы скрыть страницу
                setSubmitted(true);
                
                // Сначала переходим на главную страницу
                router.push('/');
                
                // Затем очищаем sessionStorage и сбрасываем состояния
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('phoneSelection');
                        sessionStorage.removeItem('deviceConditions');
                        sessionStorage.removeItem('additionalConditions');
                        // Устанавливаем флаг, что заявка была отправлена
                        sessionStorage.setItem('requestSubmitted', 'true');
                        console.log('sessionStorage очищен при отправке заявки');
                    }
                    
                    // Сбрасываем все состояния ТОЛЬКО после перехода
                    resetAllStates();
                    console.log('Состояния сброшены в submit после отправки');
                }, 100); // Небольшая задержка для плавного перехода
            } else {
                console.error('Ошибка при отправке заявки:', res.status);
            }
        } catch (error) {
            console.error('Ошибка при отправке заявки:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Используем цену из контекста или фиксированную цену по умолчанию
    const finalPrice = price || 48000;

    // Функция для получения процента скидки по состоянию
    const getConditionPenalty = (conditionText: string): string => {
        if (conditionText === 'Новый') {
            return '0%';
        } else if (conditionText === 'Очень хорошее') {
            return '-3%';
        } else if (conditionText === 'Заметные царапины') {
            return '-8%';
        } else if (conditionText === 'Трещины') {
            return '-15%';
        } else {
            return '0%';
        }
    };

    // Функция для отображения состояния с процентом
    const getConditionWithPenalty = (conditionText: string): string => {
        if (conditionText === 'Новый') {
            return 'Новый (0%)';
        } else if (conditionText === 'Очень хорошее') {
            return 'Очень хорошее (-3%)';
        } else if (conditionText === 'Заметные царапины') {
            return 'Заметные царапины (-8%)';
        } else if (conditionText === 'Трещины') {
            return 'Трещины (-15%)';
        } else {
            return conditionText;
        }
    };

    // Функция для отображения дополнительного состояния с процентом
    const getAdditionalConditionWithPenalty = (conditionText: string, type: string): string => {
        if (type === 'faceId') {
            return conditionText === 'Не работает' ? 'Не работает (-10%)' : 'Работает (0%)';
        } else if (type === 'touchId') {
            return conditionText === 'Не работает' ? 'Не работает (-8%)' : 'Работает (0%)';
        } else if (type === 'backCamera') {
            if (conditionText === 'Новый') return 'Новый (0%)';
            else if (conditionText === 'Очень хорошее') return 'Очень хорошее (-3%)';
            else if (conditionText === 'Заметные царапины') return 'Заметные царапины (-8%)';
            else if (conditionText === 'Трещины') return 'Трещины (-15%)';
            return conditionText;
        } else if (type === 'battery') {
            if (conditionText === '95%') return '95% (0%)';
            else if (conditionText === '90%') return '90% (-2%)';
            else if (conditionText === '85%') return '85% (-5%)';
            else if (conditionText === '75%') return '75% (-10%)';
            return conditionText;
        }
        return conditionText;
    };

    // Функция для расчета общего процента вычета
    const calculateTotalPenalty = (): number => {
        let totalPenalty = 0;
        
        // Штрафы за основные состояния устройства
        if (deviceConditions.front) {
            if (deviceConditions.front === 'Новый') totalPenalty += 0;
            else if (deviceConditions.front === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.front === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.front === 'Трещины') totalPenalty += -15;
        }
        
        if (deviceConditions.back) {
            if (deviceConditions.back === 'Новый') totalPenalty += 0;
            else if (deviceConditions.back === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.back === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.back === 'Трещины') totalPenalty += -15;
        }
        
        if (deviceConditions.side) {
            if (deviceConditions.side === 'Новый') totalPenalty += 0;
            else if (deviceConditions.side === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.side === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.side === 'Трещины') totalPenalty += -15;
        }

        // Штрафы за дополнительные состояния
        if (additionalConditions) {
            if (additionalConditions.faceId === 'Не работает') totalPenalty += -10;
            if (additionalConditions.touchId === 'Не работает') totalPenalty += -8;
            
            // Штрафы за заднюю камеру
            if (additionalConditions.backCamera === 'Новый') totalPenalty += 0;
            else if (additionalConditions.backCamera === 'Очень хорошее') totalPenalty += -3;
            else if (additionalConditions.backCamera === 'Заметные царапины') totalPenalty += -8;
            else if (additionalConditions.backCamera === 'Трещины') totalPenalty += -15;
            
            // Штрафы за батарею
            if (additionalConditions.battery === '95%') totalPenalty += 0;
            else if (additionalConditions.battery === '90%') totalPenalty += -2;
            else if (additionalConditions.battery === '85%') totalPenalty += -5;
            else if (additionalConditions.battery === '75%') totalPenalty += -10;
        }
        
        return totalPenalty;
    };

    // Функция для получения процента скидки по дополнительным условиям
    const getAdditionalConditionPenalty = (conditionText: string, type: string): string => {
        if (type === 'faceId') {
            return conditionText === 'Не работает' ? '-10%' : '0%';
        } else if (type === 'touchId') {
            return conditionText === 'Не работает' ? '-8%' : '0%';
        } else if (type === 'backCamera') {
            if (conditionText === 'Новый') return '0%';
            else if (conditionText === 'Очень хорошее') return '-3%';
            else if (conditionText === 'Заметные царапины') return '-8%';
            else if (conditionText === 'Трещины') return '-15%';
            return '0%';
        } else if (type === 'battery') {
            if (conditionText === '95%') return '0%';
            else if (conditionText === '90%') return '-2%';
            else if (conditionText === '85%') return '-5%';
            else if (conditionText === '75%') return '-10%';
            return '0%';
        }
        return '0%';
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gray-50 animate-fadeInUp my-auto">
                <div className="flex flex-col items-center justify-center w-full h-full px-6">
                    {submitted ? (
                        <div className="w-full max-w-md text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2dc2c6] mx-auto mb-4"></div>
                            <p className="text-gray-600">Перенаправляем на главную страницу...</p>
                        </div>
                    ) : !dataLoaded ? (
                        <div className="w-full max-w-md text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2dc2c6] mx-auto mb-4"></div>
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
                        <div className="w-full max-w-md space-y-6">
                        {/* Summary заявки */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                            <h3 className="text-xl font-semibold mb-5 text-center text-gray-900">
                                Заявка
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 font-medium">Модель:</span>
                                    <span className="font-semibold text-gray-900 text-right break-words">{modelname}</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Состояние устройства:</h4>
                                    <div className="space-y-3">
                                        {/* Основные состояния устройства */}
                                        {deviceConditions && deviceConditions.front && deviceConditions.back && deviceConditions.side && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Передняя панель:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.front ? getConditionWithPenalty(deviceConditions.front) : 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Задняя панель:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.back ? getConditionWithPenalty(deviceConditions.back) : 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Боковая панель:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.side ? getConditionWithPenalty(deviceConditions.side) : 'Не выбрано'}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Дополнительные состояния устройства */}
                                        {additionalConditions && additionalConditions.faceId && additionalConditions.touchId && additionalConditions.backCamera && additionalConditions.battery && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Face ID:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {additionalConditions.faceId ? getAdditionalConditionWithPenalty(additionalConditions.faceId, 'faceId') : 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Touch ID:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {additionalConditions.touchId ? getAdditionalConditionWithPenalty(additionalConditions.touchId, 'touchId') : 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Задняя камера:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {additionalConditions.backCamera ? getAdditionalConditionWithPenalty(additionalConditions.backCamera, 'backCamera') : 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Батарея:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {additionalConditions.battery ? getAdditionalConditionWithPenalty(additionalConditions.battery, 'battery') : 'Не выбрано'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Итоговая оценка:</h4>
                                    <div className="space-y-3">
                                        {/* Общий процент вычета */}
                                        {((deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side)) || 
                                          (additionalConditions && (additionalConditions.faceId || additionalConditions.touchId || additionalConditions.backCamera || additionalConditions.battery))) && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-900">Общий вычет:</span>
                                                <span className="font-bold text-red-600">
                                                    {calculateTotalPenalty() === 0 ? '0%' : `${calculateTotalPenalty()}%`}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Итоговая цена:</span>
                                            <span className="font-bold text-xl text-green-600">{finalPrice.toLocaleString()} ₽</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка отправки */}
                        <div className="w-full">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || submitting || !modelname}
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {submitting ? 'Отправляем...' : 'Отправить заявку'}
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </Page>
    );
};

export default SubmitPage;
