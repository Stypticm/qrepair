'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';

const screenCracks = {
    id: 'screen_cracks',
    category: 'Трещины на экране',
    defect: 'Разбитое стекло или трещины на дисплее',
    icon: '📱',
    levels: [
        { value: 0, label: 'Отсутствует', penalty: '0%' },
        { value: 5, label: 'Лёгкий', penalty: '5%' },
        { value: 15, label: 'Средний', penalty: '15%' },
        { value: 30, label: 'Тяжёлый', penalty: '30%' }
    ]
};

export default function DisplayCracksPage() {
    const router = useRouter();
    const { answers, setAnswers } = useStartForm();
    const [localAnswer, setLocalAnswer] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Восстанавливаем сохраненный ответ
        if (answers && answers[1] !== undefined && answers[1] !== null) {
            setLocalAnswer(answers[1]);
        }
    }, [answers]);

    const handleSelect = (value: number) => {
        setLocalAnswer(value);
        
        // Обновляем ответы в контексте
        const newAnswers = [...(answers || [])];
        newAnswers[1] = value; // Индекс 1 для трещин
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (localAnswer !== null) {
            router.push('/request/submit');
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <Page>
            <div className="flex flex-col h-full">
                <div className="flex-1 p-4">
                    <div className="grid grid-cols-2 gap-4">
                        {screenCracks.levels.map((level) => {
                            const isSelected = localAnswer === level.value;
                            return (
                                <div
                                    key={level.value}
                                    onClick={() => handleSelect(level.value)}
                                    className={`
                                        relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
                                        ${isSelected 
                                            ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200' 
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{screenCracks.icon}</div>
                                        <div className="text-lg font-semibold text-gray-800 mb-1">
                                            {level.label}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {level.penalty}
                                        </div>
                                    </div>
                                    
                                    {/* Галочка в углу выбранного элемента */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white text-base font-bold">✓</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="p-4">
                    <button
                        onClick={handleNext}
                        disabled={localAnswer === null}
                        className={`
                            w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200
                            ${localAnswer !== null
                                ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-lg'
                                : 'bg-gray-300 cursor-not-allowed'
                            }
                        `}
                    >
                        Далее
                    </button>
                </div>
            </div>
        </Page>
    );
}