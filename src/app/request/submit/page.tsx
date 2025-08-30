'use client'

import { useState } from 'react'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';



const SubmitPage = () => {
    const router = useRouter();
    const { telegramId, modelname, answers, deviceConditions, price, resetAllStates, setDeviceConditions } = useStartForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);


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
                    answers,
                    price: finalPrice,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Заявка отправлена успешно:', result);
                
                // Очищаем sessionStorage перед сбросом состояний
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('phoneSelection');
                    sessionStorage.removeItem('deviceConditions');
                    console.log('sessionStorage очищен при отправке заявки');
                }
                
                // Сбрасываем все состояния ТОЛЬКО после успешной отправки
                resetAllStates();
                console.log('Состояния сброшены в submit после отправки');
                
                // Переходим на главную страницу
                router.push('/');
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

    // Функция для расчета общего процента вычета
    const calculateTotalPenalty = (): number => {
        let totalPenalty = 0;
        
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
        
        return totalPenalty;
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gray-50 animate-fadeInUp my-auto">
                <div className="flex flex-col items-center justify-center w-full h-full px-6">
                    <div className="w-full max-w-md space-y-6">
                        {/* Summary заявки */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                            <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">
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
                                        {/* Новые состояния устройства из контекста */}
                                        {deviceConditions && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Состояние передней панели:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.front || 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Состояние задней панели:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.back || 'Не выбрано'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Состояние боковой панели:</span>
                                                    <span className="font-semibold text-gray-900 text-right break-words">
                                                        {deviceConditions.side || 'Не выбрано'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Оценка стоимости:</h4>
                                    <div className="space-y-3">
                                        {/* Проценты по состояниям */}
                                        {deviceConditions && (
                                            <>
                                                {deviceConditions.front && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Передняя панель:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {getConditionPenalty(deviceConditions.front)}
                                                        </span>
                                                    </div>
                                                )}
                                                {deviceConditions.back && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Задняя панель:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {getConditionPenalty(deviceConditions.back)}
                                                        </span>
                                                    </div>
                                                )}
                                                {deviceConditions.side && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Боковые грани:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {getConditionPenalty(deviceConditions.side)}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Общий процент вычета */}
                                        {deviceConditions && (deviceConditions.front || deviceConditions.back || deviceConditions.side) && (
                                            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
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
                </div>
            </div>
        </Page>
    );
};

export default SubmitPage;
