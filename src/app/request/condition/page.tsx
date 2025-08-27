'use client'

import { useEffect, useState } from 'react'
import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { cn } from '@/lib/utils';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

const screenScratchesLevels = [
    { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
    { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
    { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
    { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
];

const ConditionPage = () => {
    const { telegramId, setAnswers } = useStartForm();
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetch(`/api/request/condition?telegramId=${telegramId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.condition) {
                    setSelectedLevel(data.condition);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (telegramId) getData();
    }, [telegramId]);

    const handleSelect = (value: string) => {
        setSelectedLevel(value);
        // Сохраняем состояние
        if (telegramId) {
            fetch('/api/request/condition', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, condition: value }),
            });
        }
    };

    const handleNext = async () => {
        if (!telegramId || !selectedLevel) return;
        
        // Обновляем ответы в контексте
        const currentAnswers = new Array(14).fill('0');
        currentAnswers[0] = selectedLevel; // Индекс 0 для царапин экрана
        setAnswers(currentAnswers);
    };

    return (
        <Page back={true}>
            <section className="w-full flex flex-col gap-4 p-3 bg-[#F5F5F5]">
                <h2 className="w-full text-3xl text-center font-extrabold uppercase text-black flex justify-center items-center">
                    📱 Оценка состояния устройства
                </h2>

                {loading ? (
                    <div className="text-center text-lg font-semibold">Загрузка...</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Card className="border-2 border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gray-50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl">📱</span>
                                        {/* Картинка царапин на экране */}
                                        <div className="w-24 h-24 relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                                            <Image
                                                src={getPictureUrl('screen-scratches.png') || '/defects/screen-scratches.png'}
                                                alt="Царапины на экране - пример"
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded border">
                                                Экран
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl text-black">Царапины на экране</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Видимые следы на стекле дисплея
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {/* Выбор уровня дефекта */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                                        Выберите уровень повреждения:
                                    </Label>
                                    <RadioGroup
                                        value={selectedLevel}
                                        onValueChange={handleSelect}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {screenScratchesLevels.map((level) => (
                                            <div key={level.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={level.value} id={`scratches-${level.value}`} />
                                                <Label 
                                                    htmlFor={`scratches-${level.value}`}
                                                    className={cn(
                                                        "flex-1 p-3 rounded-lg border cursor-pointer text-center text-sm font-medium transition-all duration-200 hover:scale-105",
                                                        selectedLevel === level.value
                                                            ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                                    )}
                                                >
                                                    <div className={cn("text-xs px-3 py-1 rounded-full mb-2 font-bold", level.color)}>
                                                        {level.label}
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-800">
                                                        {level.penalty > 0 ? `-${level.penalty}%` : '0%'}
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {/* Кнопка подтверждения */}
                <FooterButton 
                    nextPath="/request/cracks" 
                    isNextDisabled={!selectedLevel} 
                    onNext={handleNext} 
                />
            </section>
        </Page>
    );
};

export default ConditionPage;
