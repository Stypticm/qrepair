'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';

// Трещины на экране
const screenCracks = {
    id: '2',
    category: 'Экран',
    defect: 'Трещины на экране',
    icon: '💥',
    levels: [
        { value: '0', label: 'Отсутствует', penalty: 0 },
        { value: '1', label: 'Лёгкий', penalty: 5 },
        { value: '2', label: 'Средний', penalty: 15 },
        { value: '3', label: 'Тяжёлый', penalty: 30 }
    ]
};

export default function CracksPage() {
    const { answers, setAnswers } = useStartForm();
    const [localAnswer, setLocalAnswer] = useState<string>('');

    useEffect(() => {
        if (answers && answers.length > 1) {
            // Проверяем, что значение существует
            const currentAnswer = answers[1];
            if (currentAnswer !== undefined && currentAnswer !== null) {
                setLocalAnswer(String(currentAnswer));
            } else {
                setLocalAnswer('');
            }
        } else {
            setLocalAnswer('');
        }
    }, [answers]);

    const handleSelect = (value: string) => {
        setLocalAnswer(value);
        // Сохраняем текущий ответ, не теряя предыдущие
        const newAnswers = [...(answers || [])];
        newAnswers[1] = parseInt(value);
        setAnswers(newAnswers);
    };

    const isNextDisabled = localAnswer === '';

    return (
        <Page back={true}>
            <div className="w-full">
                <div className="flex flex-col items-center justify-center w-full px-4">
                    <div className="w-full max-w-md">
                        {/* Сетка 2x2 для вариантов выбора */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {screenCracks.levels.map((level) => {
                                const isSelected = localAnswer === level.value;
                                
                                return (
                                    <div 
                                        key={level.value} 
                                        className={cn(
                                            "aspect-square cursor-pointer rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-4 relative",
                                            isSelected
                                                ? "border-black bg-gray-100 shadow-md" 
                                                : "border-black hover:bg-gray-50",
                                            "bg-white"
                                        )}
                                        onClick={() => handleSelect(level.value)}
                                    >
                                        {/* Индикатор выбора */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">✓</span>
                                            </div>
                                        )}
                                        
                                        <div className="text-center">
                                            <div className="font-bold text-lg text-black mb-2">
                                                {level.label}
                                            </div>
                                            <div className="text-sm font-bold text-black">
                                                {level.penalty > 0 ? `-${level.penalty}%` : '0%'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
}
