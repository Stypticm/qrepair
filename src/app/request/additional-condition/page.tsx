'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import {
    faceIdConditions,
    touchIdConditions,
    backCameraConditions,
    batteryConditions,
    getAdditionalConditionText,
    AdditionalConditionOption
} from '@/core/lib/additionalCondition';
import { getPictureUrl } from '@/core/lib/assets';

export default function AdditionalConditionPage() {
    const {
        modelname,
        telegramId,
        additionalConditions,
        setAdditionalConditions,
        username,
        setModel,
        setPrice
    } = useStartForm();
    const router = useRouter();

    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);

    // Флаг для отслеживания загрузки состояний из БД
    const [loadedFromDB, setLoadedFromDB] = useState(false);

    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Загрузка сохраненных состояний из sessionStorage или БД
    const loadSavedConditions = useCallback(async () => {
        console.log('Загружаю сохраненные дополнительные состояния...');

        // Сначала пытаемся загрузить из sessionStorage для быстрого восстановления
        const savedConditions = sessionStorage.getItem('additionalConditions');
        if (savedConditions) {
            try {
                const parsed = JSON.parse(savedConditions);
                setAdditionalConditions(parsed);
                console.log('Дополнительные состояния загружены из sessionStorage:', parsed);
                setLoadedFromDB(true);
                return;
            } catch (error) {
                console.error('Ошибка парсинга состояний из sessionStorage:', error);
            }
        }

        // Если нет в sessionStorage, загружаем из БД
        if (telegramId) {
            try {
                console.log('Загружаю дополнительные состояния из БД для telegramId:', telegramId);
                const response = await fetch('/api/request/getAdditionalConditions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ telegramId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Дополнительные состояния загружены из БД:', data);

                    if (data.additionalConditions) {
                        setAdditionalConditions(data.additionalConditions);
                        // Сохраняем в sessionStorage для быстрого доступа
                        sessionStorage.setItem('additionalConditions', JSON.stringify(data.additionalConditions));
                    }
                } else {
                    console.log('Не удалось загрузить дополнительные состояния из БД');
                }
            } catch (error) {
                console.error('Ошибка загрузки дополнительных состояний:', error);
            }
        }

        setLoadedFromDB(true);
    }, [setAdditionalConditions, telegramId]);

    // Загружаем состояния при монтировании компонента
    useEffect(() => {
        if (!loadedFromDB && telegramId) {
            loadSavedConditions();
        }
    }, [loadSavedConditions, loadedFromDB, telegramId]);

    // Проверяем, заполнены ли все состояния
    const areAllConditionsSelected = () => {
        return additionalConditions.faceId &&
            additionalConditions.touchId &&
            additionalConditions.backCamera &&
            additionalConditions.battery;
    };

    // Показываем диалог, когда все состояния выбраны
    useEffect(() => {
        if (loadedFromDB && areAllConditionsSelected() && hasChanges) {
            console.log('Все дополнительные состояния выбраны, показываю диалог');
            setShowDialog(true);
        }
    }, [additionalConditions, hasChanges, loadedFromDB]);

    // Обработчики диалогового окна
    const handleContinue = () => {
        setShowDialog(false);
        router.push('/request/submit');
    };

    const handleEdit = () => {
        setShowDialog(false);
        // При редактировании сбрасываем флаг изменений
        setHasChanges(false);
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        if (!telegramId) return;

        try {
            console.log('Сохраняю дополнительные состояния в БД:', newConditions);
            const response = await fetch('/api/request/saveAdditionalConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    additionalConditions: newConditions
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Дополнительные состояния успешно сохранены в БД:', result);
                setHasChanges(true);
            } else {
                console.error('Ошибка сохранения дополнительных состояний в БД');
            }
        } catch (error) {
            console.error('Ошибка при сохранении дополнительных состояний:', error);
        }
    };

    // Обработчик выбора условия
    const handleConditionSelect = (type: 'faceId' | 'touchId' | 'backCamera' | 'battery', conditionId: string) => {
        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Получаем текстовое описание состояния
        const conditionText = getAdditionalConditionText(conditionId);

        // Проверяем, изменилось ли состояние
        if (additionalConditions[type] !== conditionText) {
            const newConditions = {
                ...additionalConditions,
                [type]: conditionText
            };

            // Сначала обновляем контекст
            setAdditionalConditions(newConditions);

            // Сохраняем в sessionStorage для быстрого восстановления
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('additionalConditions', JSON.stringify(newConditions));
                console.log('Дополнительные состояния сохранены в sessionStorage:', newConditions);
            }

            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        }
    };

    // Проверяем, можно ли выбрать секцию
    const canSelectSection = (type: 'faceId' | 'touchId' | 'backCamera' | 'battery'): boolean => {
        if (type === 'faceId' || type === 'touchId') return true; // Face ID и Touch ID всегда доступны
        if (type === 'backCamera') return !!additionalConditions.faceId && !!additionalConditions.touchId; // Задняя камера только после выбора Face ID и Touch ID
        if (type === 'battery') return !!additionalConditions.faceId && !!additionalConditions.touchId && !!additionalConditions.backCamera; // Батарея только после выбора всех предыдущих
        return false;
    };

    // Функция для рендеринга секции с условиями
    const renderConditionSection = (
        title: string,
        conditions: AdditionalConditionOption[],
        type: 'faceId' | 'touchId' | 'backCamera' | 'battery',
        gridCols: string = 'grid-cols-2'
    ) => {
        // Определяем размеры контейнера в зависимости от типа
        const getImageContainerSize = () => {
            if (type === 'battery') return 'w-15 h-22'; // Вертикальные картинки батареи
            return 'w-14 h-14'; // Квадратные картинки для остальных
        };

        return (
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                    {title}
                    {!canSelectSection(type) && (
                        <span className="block text-sm text-gray-500 font-normal mt-1">
                            {type === 'backCamera' ? 'Сначала выберите Face ID и Touch ID' : 'Сначала выберите все предыдущие условия'}
                        </span>
                    )}
                </h3>
                <div className={`grid ${gridCols} gap-3 ${!canSelectSection(type) ? 'opacity-50' : ''}`}>
                    {conditions.map((condition) => {
                        const isSelected = additionalConditions[type] === condition.label;
                        return (
                            <Card
                                key={condition.id}
                                className={`transition-all duration-200 relative ${isSelected
                                        ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                        : ''
                                    } ${canSelectSection(type)
                                        ? 'cursor-pointer hover:shadow-md'
                                        : 'cursor-not-allowed'
                                    }`}
                                onClick={() => canSelectSection(type) && handleConditionSelect(type, condition.id)}
                            >
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                )}
                                <CardContent className="p-0.5">
                                    <div className="flex flex-col items-center space-y-1">
                                        <div className={`relative ${getImageContainerSize()} rounded-lg overflow-hidden bg-gray-100`}>
                                            <Image
                                                src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}?v=${Date.now()}`}
                                                alt={condition.label}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-center whitespace-pre-line">
                                            {condition.label}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="w-full max-w-md mx-auto space-y-6">


                        {/* Face ID и Touch ID в одной строке */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 text-center">Face ID / Touch ID</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {faceIdConditions.map((condition) => {
                                            const isSelected = additionalConditions.faceId === condition.label;
                                            return (
                                                <Card
                                                    key={condition.id}
                                                    className={`transition-all duration-200 relative ${isSelected
                                                            ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                                            : ''
                                                        } cursor-pointer hover:shadow-md`}
                                                    onClick={() => handleConditionSelect('faceId', condition.id)}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                            <span className="text-white text-xs font-bold">✓</span>
                                                        </div>
                                                    )}
                                                    <CardContent className="p-0.5">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                                <Image
                                                                    src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}?v=${Date.now()}`}
                                                                    alt={condition.label}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-center">
                                                                {condition.label}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {touchIdConditions.map((condition) => {
                                            const isSelected = additionalConditions.touchId === condition.label;
                                            return (
                                                <Card
                                                    key={condition.id}
                                                    className={`transition-all duration-200 relative ${isSelected
                                                            ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                                            : ''
                                                        } cursor-pointer hover:shadow-md`}
                                                    onClick={() => handleConditionSelect('touchId', condition.id)}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                            <span className="text-white text-xs font-bold">✓</span>
                                                        </div>
                                                    )}
                                                    <CardContent className="p-0.5">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                                <Image
                                                                    src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}?v=${Date.now()}`}
                                                                    alt={condition.label}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-center">
                                                                {condition.label}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Задняя камера */}
                        {renderConditionSection('Задняя камера', backCameraConditions, 'backCamera', 'grid-cols-4')}

                        {/* Батарея */}
                        {renderConditionSection('Батарея', batteryConditions, 'battery', 'grid-cols-4')}
                    </div>
                </div>
            </div>

            {/* Диалоговое окно с итоговой информацией */}
            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    onClick={handleContinue}
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                        📱 Дополнительная оценка
                    </DialogTitle>

                    <div className="text-center">
                        {/* Показываем выбранные условия */}
                        <div className="space-y-2 mb-4">
                            {additionalConditions.faceId && (
                                <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                    <span className="text-gray-600">Face ID:</span>
                                    <span className="font-medium text-gray-900">{additionalConditions.faceId}</span>
                                </div>
                            )}
                            {additionalConditions.touchId && (
                                <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                    <span className="text-gray-600">Touch ID:</span>
                                    <span className="font-medium text-gray-900">{additionalConditions.touchId}</span>
                                </div>
                            )}
                            {additionalConditions.backCamera && (
                                <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                    <span className="text-gray-600">Задняя камера:</span>
                                    <span className="font-medium text-gray-900">{additionalConditions.backCamera}</span>
                                </div>
                            )}
                            {additionalConditions.battery && (
                                <div className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                    <span className="text-gray-600">Батарея:</span>
                                    <span className="font-medium text-gray-900">{additionalConditions.battery}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-3">
                            👆 Нажмите на окно для перехода к следующему шагу
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">
                            ✏️ Нажмите вне поля, если хотите отредактировать свой выбор
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
