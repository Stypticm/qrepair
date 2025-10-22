'use client'

import { useRouter } from 'next/navigation';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import {
    faceIdConditions,
    backCameraConditions,
    batteryConditions,
    getAdditionalConditionText,
    AdditionalConditionOption
} from '@/core/lib/additionalCondition';
import { getPictureUrl } from '@/core/lib/assets';
import { Tooltip } from '@/components/ui/tooltip';
import { calculatePriceRange, DeviceConditions, AdditionalConditions } from "@/core/lib/priceCalculation";
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ImagePreloader } from '@/components/ImagePreloader/ImagePreloader';
import { getAdditionalConditionImages } from '@/core/lib/imageUtils';


export default function AdditionalConditionPage() {
    const {
        modelname,
        telegramId,
        deviceConditions,
        setDeviceConditions,
        username,
        setModel,
        setPrice,
        setCurrentStep
    } = useAppStore();
    const router = useRouter();
    const { goBack } = useStepNavigation();

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('additional-condition');
    }, [setCurrentStep]);

    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);

    // Флаг для отслеживания загрузки состояний из БД
    const [loadedFromDB, setLoadedFromDB] = useState(false);


    // Флаг для отключения подсказок при загрузке данных
    const [showHints, setShowHints] = useState(true);

    // Состояние для режима редактирования
    const [isEditing, setIsEditing] = useState(false);

    // Состояние для определения, все ли выбрано
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Шаги для прогресс-бара
    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        // Показываем шаг 4 на странице additional-condition
        return 4;
    };

    // Функция для проверки, все ли выбрано
    const checkIfAllSelected = useCallback((conditions: any) => {
        return conditions.faceId && conditions.touchId && conditions.backCamera && conditions.battery;
    }, []);


    // Сначала пытаемся восстановить из sessionStorage
    // Загружаем состояния при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            // 1. Попытка восстановить из sessionStorage
            const savedInSession = sessionStorage.getItem('deviceConditions');
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    const hasValidData = parsed && typeof parsed === 'object' && (parsed.faceId || parsed.touchId || parsed.backCamera || parsed.battery);

                    if (hasValidData) {
                        setDeviceConditions(parsed);
                        setIsEditing(true);
                        setIsAllSelected(!!checkIfAllSelected(parsed));
                        setHasChanges(true);
                        setShowHints(false);
                    } else {
                        sessionStorage.removeItem('deviceConditions');
                    }
                    setLoadedFromDB(true);
                    return; // Данные из сессии загружены, выходим
                } catch (e) {
                    console.error('Ошибка парсинга deviceConditions из sessionStorage:', e);
                    sessionStorage.removeItem('deviceConditions');
                }
            }

            // 2. Если в сессии нет, и есть telegramId, грузим из БД
            if (telegramId) {
                try {
                    const response = await fetch('/api/request/getAdditionalConditions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegramId }),
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.status === 'submitted') {
                            // Заявка отправлена, сбрасываем состояние
                            setDeviceConditions({ faceId: null, touchId: null, backCamera: null, battery: null } as any);
                            setHasChanges(false);
                        } else if (data.deviceConditions) {
                            const hasOldData = (data.deviceConditions as any).faceId || (data.deviceConditions as any).touchId || (data.deviceConditions as any).backCamera || (data.deviceConditions as any).battery;
                            if (hasOldData) {
                                setDeviceConditions(data.deviceConditions);
                                setHasChanges(true);
                                setShowHints(false);
                                sessionStorage.setItem('deviceConditions', JSON.stringify(data.deviceConditions));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Ошибка загрузки дополнительных состояний из БД:', error);
                }
            }

            // 3. Создаем/обновляем шаг заявки в БД
            if (telegramId) {
                try {
                    await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                            currentStep: 'additional-condition',
                        }),
                    });
                } catch (error) {
                    console.error('Error updating request step:', error);
                }
            }

            setLoadedFromDB(true);
        };

        loadData();
    }, [telegramId, username, setDeviceConditions, checkIfAllSelected]);

    // Проверяем, заполнены ли все состояния
    const areAllConditionsSelected = useCallback(() => {
        return (deviceConditions as any)?.faceId &&
            (deviceConditions as any)?.touchId &&
            (deviceConditions as any)?.backCamera &&
            (deviceConditions as any)?.battery;
    }, [deviceConditions]);

    // Функция расчета цены с учетом дополнительных условий
    const calculatePriceWithAdditionalConditions = useCallback(async () => {
        try {
            // Получаем базовую цену из sessionStorage
            const savedBasePrice = sessionStorage.getItem('basePrice');
            if (!savedBasePrice) {
                console.error('Не найдена базовая цена в sessionStorage');
                return;
            }

            const basePrice = parseFloat(savedBasePrice);
            if (!basePrice || basePrice <= 0) {
                console.error('Невалидная базовая цена:', basePrice);
                return;
            }

            // Получаем deviceConditions из sessionStorage
            const deviceConditions = sessionStorage.getItem('deviceConditions');
            let deviceConditionsData: DeviceConditions = {};
            if (deviceConditions) {
                deviceConditionsData = JSON.parse(deviceConditions);
            }

            // Получаем модель устройства
            const modelName = modelname; // Модель всегда валидна из БД

            // Нормализуем дополнительные условия (null -> undefined) под тип AdditionalConditions
            const normalizedAdditional: AdditionalConditions = {
                faceId: (deviceConditions as any)?.faceId ?? undefined,
                touchId: (deviceConditions as any)?.touchId ?? undefined,
                backCamera: (deviceConditions as any)?.backCamera ?? undefined,
                battery: (deviceConditions as any)?.battery ?? undefined,
            }

            // Используем новую формулу расчёта диапазона цен
            const priceRange = calculatePriceRange(
                basePrice,
                modelName,
                deviceConditionsData,
                normalizedAdditional
            );

            // Обновляем цену в контексте (используем midpoint)
            setPrice(priceRange.midpoint);

            // Сохраняем в sessionStorage
            sessionStorage.setItem('price', JSON.stringify(priceRange.midpoint));
            sessionStorage.setItem('calculatedPrice', JSON.stringify(priceRange.midpoint));
            sessionStorage.setItem('priceRange', JSON.stringify(priceRange));

        } catch (error) {
            console.error('Ошибка при расчете цены:', error);
        }
    }, [deviceConditions, setPrice, modelname]);

    // Показываем диалог когда все условия выбраны И пользователь делал изменения
    useEffect(() => {
        if (areAllConditionsSelected() && hasChanges) {

            // Рассчитываем цену перед показом диалога
            calculatePriceWithAdditionalConditions();

            setShowDialog(true);

            // Устанавливаем флаг "все выбрано"
            setIsAllSelected(true);
        }
    }, [deviceConditions, areAllConditionsSelected, hasChanges, calculatePriceWithAdditionalConditions]);

    // Обработчики диалогового окна
    const handleContinue = () => {
        setShowDialog(false);
        // Принудительно закрываем диалог в DOM и убираем backdrop
        setTimeout(() => {
            const dialogs = document.querySelectorAll('[role="dialog"]');
            dialogs.forEach(dialog => {
                if (dialog instanceof HTMLElement) {
                    dialog.style.display = 'none';
                }
            });

            // Убираем backdrop (серый фон)
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
            backdrops.forEach(backdrop => {
                if (backdrop instanceof HTMLElement) {
                    backdrop.style.display = 'none';
                }
            });
        }, 0);
        // Быстрый переход без задержки
        router.push('/request/submit');
    };

    const handleEdit = () => {
        setShowDialog(false);
        // При редактировании сбрасываем флаг изменений
        setHasChanges(false);

        // Убираем backdrop (серый фон) при редактировании
        setTimeout(() => {
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
            backdrops.forEach(backdrop => {
                if (backdrop instanceof HTMLElement) {
                    backdrop.style.display = 'none';
                }
            });
        }, 50);
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        if (!telegramId) return;

        try {
            const response = await fetch('/api/request/saveAdditionalConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    additionalConditions: newConditions,
                    currentStep: 'additional-condition'
                }),
            });

            if (response.ok) {
                const result = await response.json();
                // setHasChanges(true); // Убираем отсюда, так как устанавливаем раньше
            } else {
                const errorData = await response.json();
                console.error('[saveConditionsToDatabase] Ошибка сохранения дополнительных состояний в БД:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            }
        } catch (error) {
            console.error('[saveConditionsToDatabase] Ошибка при сохранении дополнительных состояний:', error);
        }
    };

    // Обработчик выбора условия
    const handleConditionSelect = (type: 'faceId' | 'touchId' | 'backCamera' | 'battery', conditionId: string) => {

        // Проверяем, можно ли выбрать этот тип
        if (!canSelectSection(type)) {
            return;
        }

        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Получаем текстовое описание состояния
        const conditionText = getAdditionalConditionText(conditionId);

        // Проверяем, изменилось ли состояние
        if ((deviceConditions as any)?.[type] !== conditionText) {
            const newConditions = {
                ...(deviceConditions as any || {}),
                [type]: conditionText
            };


            // Сначала обновляем контекст
            setDeviceConditions(newConditions);

            // Сбрасываем режим редактирования при новом выборе
            setIsEditing(false);

            // Сбрасываем флаг "все выбрано" при изменении
            setIsAllSelected(false);

            // Сразу устанавливаем флаг изменений для мгновенного показа диалога
            setHasChanges(true);



            // Сохраняем в sessionStorage для быстрого восстановления
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('deviceConditions', JSON.stringify(newConditions));
            }

            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        } else {
        }
    };

    // Проверяем, можно ли выбрать секцию
    const canSelectSection = (type: 'faceId' | 'touchId' | 'backCamera' | 'battery'): boolean => {
        if (type === 'backCamera') return true; // Задняя камера всегда доступна
        if (type === 'battery') return !!(deviceConditions as any)?.backCamera; // Батарея только после выбора задней камеры
        if (type === 'faceId') return !!(deviceConditions as any)?.battery; // Face ID только после выбора батареи
        if (type === 'touchId') return !!(deviceConditions as any)?.faceId; // Touch ID только после выбора Face ID
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
            if (type === 'battery') return 'w-14 h-24'; // Вертикальные картинки батареи
            return 'w-14 h-14'; // Квадратные картинки для остальных
        };

        return (
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                    {title}
                </h3>
                <div className={`grid ${gridCols} gap-1 ${!canSelectSection(type) ? 'opacity-50' : ''}`}>
                    {conditions.map((condition) => {
                        const isSelected = (deviceConditions as any)?.[type] === condition.label;
                        return (
                            <Card
                                key={condition.id}
                                className={`transition-all duration-200 relative border-0 shadow-none ${isSelected
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
                                        <motion.div
                                            className={`relative ${getImageContainerSize()} rounded-lg overflow-hidden bg-gray-100`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                        >
                                            <Image
                                                src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}`}
                                                alt={condition.label}
                                                fill
                                                className="object-cover transition-transform duration-200 hover:scale-105"
                                                loading="eager"
                                                priority={false}
                                            />
                                        </motion.div>
                                        {type !== 'battery' && (
                                            <span className="text-xs font-medium text-gray-900 text-center whitespace-pre-line">
                                                {condition.label}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Список изображений для предзагрузки (только те, что не были предзагружены на главной)
    const preloadImages = getAdditionalConditionImages();

    return (
        <Page back={goBack}>
            <ImagePreloader images={preloadImages} />
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-12 overflow-hidden">
                {/* Прогресс-бар */}
                <div className="pt-6 pb-2">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-3 pt-2 flex items-start justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-1 pb-4">


                        {/* Задняя камера */}
                        {true && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm"
                            >
                                {renderConditionSection('Задняя камера', backCameraConditions, 'backCamera', 'grid-cols-4')}
                            </motion.div>
                        )}

                        {/* Батарея */}
                        {(deviceConditions as any)?.backCamera && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 rounded-xl shadow-sm bg-white"
                            >
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-800 text-center">
                                        Батарея
                                    </h3>

                                    <div className={`grid grid-cols-4 gap-1 ${!canSelectSection('battery') ? 'opacity-50' : ''}`}>
                                        {batteryConditions.map((condition) => {
                                            const isSelected = (deviceConditions as any)?.battery === condition.label;
                                            const percentage = parseInt(condition.label.replace('%', ''));
                                            return (
                                                <motion.div
                                                    key={condition.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ duration: 0.1 }}
                                                >
                                                    <Card
                                                        className={`transition-all duration-200 relative border-0 shadow-none ${isSelected
                                                            ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                                            : ''
                                                            } ${canSelectSection('battery')
                                                                ? 'cursor-pointer hover:shadow-md'
                                                                : 'cursor-not-allowed'
                                                            }`}
                                                        onClick={() => canSelectSection('battery') && handleConditionSelect('battery', condition.id)}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                                <span className="text-white text-xs font-bold">✓</span>
                                                            </div>
                                                        )}
                                                        <CardContent className="p-3">
                                                            <div className="flex flex-col items-center space-y-2">
                                                                <motion.div
                                                                    className="relative w-16 h-24 rounded-lg overflow-hidden bg-gray-100"
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                                >
                                                                    <Image
                                                                        src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}`}
                                                                        alt={condition.label}
                                                                        fill
                                                                        className="object-cover transition-transform duration-200 hover:scale-105"
                                                                        loading="eager"
                                                                        priority={false}
                                                                    />
                                                                </motion.div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Face ID / Touch ID на одной строке */}
                        {(deviceConditions as any)?.battery && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-800 text-center">Face ID / Touch ID</h3>

                                    <div className={`grid grid-cols-4 gap-2 ${!canSelectSection('faceId') ? 'opacity-50' : ''}`}>
                                        {/* Face ID */}
                                        {faceIdConditions.map((condition) => {
                                            const isSelected = (deviceConditions as any)?.faceId === condition.label;
                                            return (
                                                <motion.div key={condition.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
                                                    <Card className={`transition-all duration-200 relative border-0 shadow-none ${isSelected ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10' : ''} ${canSelectSection('faceId') ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}`} onClick={() => canSelectSection('faceId') && handleConditionSelect('faceId', condition.id)}>
                                                        {isSelected && (<div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10"><span className="text-white text-xs font-bold">✓</span></div>)}
                                                        <CardContent className="p-2">
                                                            <div className="flex flex-col items-center space-y-1">
                                                                <motion.div
                                                                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100"
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                                >
                                                                    <Image
                                                                        src={`${getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}`}
                                                                        alt={condition.label}
                                                                        fill
                                                                        className="object-cover transition-transform duration-200 hover:scale-105"
                                                                        loading="eager"
                                                                        priority={false}
                                                                    />
                                                                </motion.div>
                                                                <span className="text-xs font-medium text-gray-900 text-center">
                                                                    {condition.label}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}


                    </div>
                </div>
            </div>

            {/* Диалоговое окно с итоговой информацией */}
            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    onClick={handleContinue}
                    showCloseButton={false}
                    aria-describedby="dialog-description"
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                        Дополнительные условия устройства
                    </DialogTitle>
                    <div id="dialog-description" className="sr-only">
                        Диалог с выбранными дополнительными условиями устройства. Нажмите для продолжения или вне диалога для редактирования.
                    </div>

                    <div className="text-center">
                        {/* Рамка для выбранных условий */}
                        <div className="bg-[#2dc2c6]/10 rounded-2xl p-5 border border-[#2dc2c6] shadow-lg mb-4">
                            <div className="space-y-3">
                                {(deviceConditions as any)?.faceId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Face ID:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {(deviceConditions as any)?.faceId}
                                        </span>
                                    </div>
                                )}
                                {(deviceConditions as any)?.touchId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Touch ID:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {(deviceConditions as any)?.touchId}
                                        </span>
                                    </div>
                                )}
                                {(deviceConditions as any)?.backCamera && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Задняя камера:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {(deviceConditions as any)?.backCamera}
                                        </span>
                                    </div>
                                )}
                                {(deviceConditions as any)?.battery && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Батарея:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {(deviceConditions as any)?.battery}
                                        </span>
                                    </div>
                                )}

                            </div>
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
