'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

interface ConditionOption {
    id: string;
    label: string;
    penalty: string;
    image: string;
}

const frontConditions: ConditionOption[] = [
    {
        id: 'display_front_new',
        label: 'Новый',
        penalty: '0%',
        image: 'display_front_new'
    },
    {
        id: 'display_front',
        label: 'Очень\nхорошее',
        penalty: '-5%',
        image: 'display_front'
    },
    {
        id: 'display_front_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: '-15%',
        image: 'display_front_have_scratches'
    },
    {
        id: 'display_front_scratches',
        label: 'Трещины',
        penalty: '-25%',
        image: 'display_front_scratches'
    }
];

const backConditions: ConditionOption[] = [
    {
        id: 'display_back_new',
        label: 'Новый',
        penalty: '0%',
        image: 'display_back_new'
    },
    {
        id: 'display_back',
        label: 'Очень\nхорошее',
        penalty: '-5%',
        image: 'display_back'
    },
    {
        id: 'display_back_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: '-15%',
        image: 'display_back_have_scratches'
    },
    {
        id: 'display_back_scratches',
        label: 'Трещины',
        penalty: '-25%',
        image: 'display_back_scratches'
    }
];

const sideConditions: ConditionOption[] = [
    {
        id: 'display_side_new',
        label: 'Новый',
        penalty: '0%',
        image: 'display_side_new'
    },
    {
        id: 'display_side',
        label: 'Очень\nхорошее',
        penalty: '-5%',
        image: 'display_side'
    },
    {
        id: 'display_side_have_scratches',
        label: 'Заметные\nцарапины',
        penalty: '-15%',
        image: 'display_side_have_scratches'
    },
    {
        id: 'display_side_scratches',
        label: 'Трещины',
        penalty: '-25%',
        image: 'display_side_scratches'
    }
];

export default function ConditionPage() {
    const { modelname, telegramId, deviceConditions, setDeviceConditions, username } = useStartForm();
    const router = useRouter();
    
    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);

    // Загрузка сохраненных состояний из БД
    const loadSavedConditions = useCallback(async () => {
        try {
            const response = await fetch('/api/request/getConditions', {
                headers: {
                    'x-telegram-id': telegramId || 'test-user'
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.deviceConditions) {
                    console.log('Загружены состояния из БД:', data.deviceConditions);
                    setDeviceConditions(data.deviceConditions);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки состояний из БД:', error);
        }
    }, [telegramId, setDeviceConditions]);

    // Проверяем, все ли условия выбраны
    const isAllConditionsSelected = useCallback(() => {
        return deviceConditions.front && deviceConditions.back && deviceConditions.side;
    }, [deviceConditions]);

    // Загружаем сохраненные состояния при загрузке страницы
    useEffect(() => {
        // Загружаем состояния из БД (как в request/form)
        loadSavedConditions();
    }, [loadSavedConditions]);

    // Автоматический переход после выбора всех условий
    useEffect(() => {
        // Проверяем, все ли условия выбраны И есть ли изменения
        if (isAllConditionsSelected() && hasChanges) {
            setTimeout(() => {
                router.push('/request/submit');
            }, 1000);
        }
    }, [deviceConditions, hasChanges, router, isAllConditionsSelected]);

    // Создаем заявку при загрузке страницы (как в request/form)
    useEffect(() => {
        const createRequest = async () => {
            if (telegramId) {
                try {
                    await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                        }),
                    });
                } catch (error) {
                    console.error('Error creating request:', error);
                }
            }
        };

        createRequest();
    }, [telegramId, username]);


    // Убираем сохранение в БД
    // const saveConditionsToDatabase = async () => { ... };

    // Обработчик выбора условия
    const handleConditionSelect = (type: 'front' | 'back' | 'side', conditionId: string) => {
        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        // Получаем текстовое описание состояния
        const conditionText = getConditionText(conditionId);
        
        // Проверяем, изменилось ли состояние
        if (deviceConditions[type] !== conditionText) {
            setHasChanges(true);
            
            // Сохраняем состояния в БД при изменении
            saveConditionsToDatabase({
                ...deviceConditions,
                [type]: conditionText
            });
        }
        
        setDeviceConditions({
            ...deviceConditions,
            [type]: conditionText
        });
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        try {
            const response = await fetch('/api/request/saveConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-id': telegramId || 'test-user'
                },
                body: JSON.stringify({
                    deviceConditions: newConditions
                }),
            });

            if (response.ok) {
                console.log('Состояния сохранены в БД');
            } else {
                console.error('Ошибка сохранения состояний в БД');
            }
        } catch (error) {
            console.error('Ошибка при сохранении состояний в БД:', error);
        }
    };

    // Функция для получения текстового описания состояния
    const getConditionText = (conditionId: string): string => {
        if (conditionId.includes('_new')) {
            return 'Новый';
        } else if (conditionId.includes('_have_scratches')) {
            return 'Значительные царапины';
        } else if (conditionId.includes('_scratches')) {
            return 'Трещины';
        } else if (conditionId.includes('display_front') || conditionId.includes('display_back') || conditionId.includes('display_side')) {
            return 'Очень хорошее';
        } else {
            return conditionId; // fallback
        }
    };

    // Рендерим секцию выбора условий
    const renderConditionSection = (type: 'front' | 'back' | 'side', conditions: ConditionOption[]) => {
        // Разные размеры изображений для разных секций
        const getImageStyle = () => {
            if (type === 'side') {
                // Боковые грани - такая же ширина как у передней и задней части, но узкие по высоте
                return 'w-full h-6 rounded-lg';
            } else {
                // Передняя и задняя панель - прямоугольные как телефон, большая высота для полной видимости без обрезки
                return 'w-full h-36 rounded-lg';
            }
        };

        return (
            <div className="space-y-1">
                {/* Заголовок секции */}
                <h3 className="text-base font-semibold text-gray-900 text-center">
                    {type === 'front' ? 'Передняя часть' : type === 'back' ? 'Задняя панель' : 'Боковые грани'}
                </h3>

                {/* Сетка вариантов */}
                <div className="grid grid-cols-4 gap-2">
                    {conditions.map((condition) => (
                        <Card
                            key={condition.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                                deviceConditions[type] === getConditionText(condition.id)
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleConditionSelect(type, condition.id)}
                        >
                            {deviceConditions[type] === getConditionText(condition.id) && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm z-10">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            )}
                            <CardContent className="p-0.5 pb-0">
                                {/* Изображение - разные размеры для разных секций */}
                                <div className={`relative ${getImageStyle()} overflow-hidden bg-gray-100`}>
                                    <Image
                                        src={getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}
                                        alt={condition.label}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 25vw, 20vw"
                                    />
                                </div>

                                {/* Название условия */}
                                <h4 className="text-xs font-medium text-gray-900 text-center leading-tight whitespace-pre-line mt-0.5">
                                    {condition.label}
                                </h4>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 p-4">
                    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
                        
                        {/* Секция передней части экрана */}
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {renderConditionSection('front', frontConditions)}
                        </div>

                        {/* Разделитель */}
                        <div className="border-t border-gray-200 my-3"></div>

                        {/* Секция задней панели */}
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {renderConditionSection('back', backConditions)}
                        </div>

                        {/* Разделитель */}
                        <div className="border-t border-gray-200 my-3"></div>

                        {/* Секция боковых граней */}
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {renderConditionSection('side', sideConditions)}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
}
