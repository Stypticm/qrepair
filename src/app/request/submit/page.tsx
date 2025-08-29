'use client'

import { useEffect, useState } from 'react'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';

// Цены для разных моделей iPhone
const deviceCatalog = {
    'Apple iPhone 11': { name: 'Apple iPhone 11', basePrice: 48000 },
    'Apple iPhone 12': { name: 'Apple iPhone 12', basePrice: 56000 },
    'Apple iPhone 13': { name: 'Apple iPhone 13', basePrice: 64000 },
    'Apple iPhone 14': { name: 'Apple iPhone 14', basePrice: 72000 },
    'Apple iPhone 15': { name: 'Apple iPhone 15', basePrice: 80000 },
} as const;

const SubmitPage = () => {
    const router = useRouter();
    const { telegramId, modelname, answers } = useStartForm();
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
                }),
            });

            if (res.ok) {
                // Сразу переходим на главную страницу без диалога
                router.push('/');
            }
        } catch (error) {
            console.error('Ошибка при отправке заявки:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getTotalPenalty = () => {
        if (!answers || answers.length === 0) return 0;
        return answers.reduce((total, answer) => total + (answer || 0), 0);
    };

    const totalPenalty = getTotalPenalty();
    
    // Извлекаем базовую модель из полного названия (например, "Apple iPhone 11 Pro Max 128GB Золотой Китай 2 SIM" -> "Apple iPhone 11")
    const baseModelMatch = modelname ? modelname.match(/Apple iPhone (\d+)/) : null;
    const baseModel = baseModelMatch ? `Apple iPhone ${baseModelMatch[1]}` : 'Apple iPhone 11';
    
    const basePrice = deviceCatalog[baseModel as keyof typeof deviceCatalog]?.basePrice || 48000;
    const finalPrice = Math.max(basePrice - (basePrice * totalPenalty / 100), 0);

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gray-50">
                <div className="flex flex-col items-center justify-center w-full h-full px-6">
                    <div className="w-full max-w-md space-y-6">
                        {/* Summary заявки */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                            <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">
                                📋 Заявка
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 font-medium">Модель:</span>
                                    <span className="font-semibold text-gray-900 text-right break-words max-w-[60%]">{modelname}</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Состояние устройства:</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Царапины на экране:</span>
                                            <span className="font-semibold text-gray-900">
                                                {answers && answers[0] !== undefined ? 
                                                    ['Отсутствует', 'Лёгкий', 'Средний', 'Тяжёлый'][answers[0]] : 
                                                    'Не выбрано'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Трещины на экране:</span>
                                            <span className="font-semibold text-gray-900">
                                                {answers && answers[1] !== undefined ? 
                                                    ['Отсутствует', 'Лёгкий', 'Средний', 'Тяжёлый'][answers[1]] : 
                                                    'Не выбрано'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Оценка стоимости:</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Базовая цена:</span>
                                            <span className="font-bold text-gray-900">{basePrice.toLocaleString()} ₽</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Оценка состояния:</span>
                                            <span className="font-bold text-red-600">-{totalPenalty}%</span>
                                        </div>
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
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
