'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { Page } from '@/components/Page';

// Только царапины на экране
const screenScratches = {
    id: '1',
    category: 'Экран',
    defect: 'Царапины на экране',
    icon: '📱',
    image: 'screen-scratches.png',
    levels: [
        { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
        { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
        { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
        { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
    ]
};

export default function QuestionsPage() {
    const { answers, setAnswers } = useStartForm();
    const [localAnswer, setLocalAnswer] = useState<string>('');

    useEffect(() => {
        if (answers && answers.length > 0) {
            // Проверяем, что значение существует
            const currentAnswer = answers[0];
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
        newAnswers[0] = parseInt(value);
        setAnswers(newAnswers);
    };

    const isNextDisabled = localAnswer === '';

    return (
        <Page back={true}>
            <div className="w-full">
                <div className="flex flex-col items-center justify-center w-full px-4">
                    <div className="w-full max-w-md">
                        {screenScratches.image && (
                            <div className="flex justify-center mb-6">
                                <Image
                                    src={getPictureUrl(screenScratches.image)}
                                    alt={screenScratches.defect}
                                    width={200}
                                    height={150}
                                    className="rounded-lg shadow-md"
                                />
                            </div>
                        )}

                        <RadioGroup value={localAnswer} onValueChange={handleSelect} className="space-y-3 w-full">
                            {screenScratches.levels.map((level) => {
                                const isSelected = localAnswer === level.value;
                                
                                return (
                                    <div key={level.value} className="flex items-center space-x-3 w-full">
                                        <RadioGroupItem value={level.value} id={`level-${level.value}`} />
                                        <Label 
                                            htmlFor={`level-${level.value}`} 
                                            className={cn(
                                                "flex-1 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 w-full",
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50 shadow-md" 
                                                    : "border-gray-200 hover:border-gray-300",
                                                level.color
                                            )}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-medium">{level.label}</span>
                                                <span className="text-sm font-bold">
                                                    {level.penalty > 0 ? `-${level.penalty}%` : '0%'}
                                                </span>
                                            </div>
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </Page>
    );
}
