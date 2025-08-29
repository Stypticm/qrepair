'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Page } from '@/components/Page';

const screenScratches = {
    id: 'screen_scratches',
    category: 'Царапины на экране',
    defect: 'Поверхностные повреждения экрана',
    icon: '📱',
    levels: [
        { value: 0, label: 'Отсутствует', penalty: '0%' },
        { value: 1, label: 'Лёгкий', penalty: '5%' },
        { value: 2, label: 'Средний', penalty: '15%' },
        { value: 3, label: 'Тяжёлый', penalty: '30%' }
    ]
};

export default function DisplayScratchesPage() {
    const router = useRouter();
    const { answers, setAnswers } = useStartForm();
    const [localAnswer, setLocalAnswer] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Восстанавливаем сохраненный ответ
        if (answers && answers[0] !== undefined && answers[0] !== null) {
            setLocalAnswer(answers[0]);
        } else {
            setLocalAnswer(null);
        }
    }, [answers]);

    // Проверяем, был ли уже сделан выбор при загрузке страницы
    useEffect(() => {
        if (isClient && localAnswer !== null) {
            // Если выбор уже сделан, не перекидываем автоматически
            // Пользователь может изменить выбор
        }
    }, [isClient, localAnswer]);

    const handleSelect = (value: number) => {
        setLocalAnswer(value);
        
        // Обновляем ответы в контексте
        const newAnswers = [...(answers || [])];
        newAnswers[0] = value; // Индекс 0 для царапин
        setAnswers(newAnswers);
        
        // Автоматический переход через 1 секунду
        setTimeout(() => {
            router.push('/request/display_cracks');
        }, 1000);
    };

    if (!isClient) {
        return null;
    }

    return (
        <Page>
            <div className="flex flex-col h-full bg-gray-50 animate-fadeIn">
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {screenScratches.levels.map((level) => {
                            const isSelected = localAnswer === level.value;
                            return (
                                <div
                                    key={level.value}
                                    onClick={() => handleSelect(level.value)}
                                    className={`
                                        relative p-6 rounded-2xl border cursor-pointer transition-all duration-200
                                        ${isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-3">{screenScratches.icon}</div>
                                        <div className="text-lg font-semibold text-gray-900 mb-2">
                                            {level.label}
                                        </div>
                                        <div className="text-sm text-gray-600 font-medium">
                                            {level.penalty}
                                        </div>
                                    </div>
                                    
                                    {/* Маленькая галочка в углу выбранного элемента */}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white text-sm font-bold">✓</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Page>
    );
}