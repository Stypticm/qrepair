'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
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
import { Tooltip } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ImagePreloader } from '@/components/ImagePreloader/ImagePreloader';
import { getAdditionalConditionImages } from '@/core/lib/imageUtils';


export default function AdditionalConditionPage() {
    const {
        modelname,
        telegramId,
        additionalConditions,
        setAdditionalConditions,
        username,
        setModel,
        setPrice,
        setCurrentStep
    } = useAppStore();
    const router = useRouter();

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
    const checkIfAllSelected = (conditions: typeof additionalConditions) => {
        return conditions.faceId &&
            conditions.touchId &&
            conditions.backCamera &&
            conditions.battery;
    };



    // Загрузка сохраненных состояний из sessionStorage или БД
    const loadSavedConditions = useCallback(async () => {
        console.log('Загружаю сохраненные дополнительные состояния...');



        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('additionalConditions');
            console.log('[loadSavedConditions] Проверяем sessionStorage:', savedInSession);

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('[loadSavedConditions] Найдено в sessionStorage:', savedInSession);
                    console.log('[loadSavedConditions] Распарсено из sessionStorage:', parsed);

                    // Дополнительная проверка - если данные пустые или некорректные, не загружаем
                    const hasValidData = parsed &&
                        typeof parsed === 'object' &&
                        (parsed.faceId || parsed.touchId || parsed.backCamera || parsed.battery);

                    if (hasValidData) {
                        setAdditionalConditions(parsed);
                        
                        // Проверяем, есть ли уже выбранные элементы (режим редактирования)
                        const hasSelectedItems = parsed.faceId || parsed.touchId || parsed.backCamera || parsed.battery;
                        if (hasSelectedItems) {
                            setIsEditing(true);
                            // Проверяем, все ли выбрано
                            const allSelected = checkIfAllSelected(parsed);
                            setIsAllSelected(!!allSelected);
                        }
                        
                        setHasChanges(true); // Устанавливаем флаг изменений для восстановленных состояний
                        setShowHints(false); // Отключаем подсказки при загрузке данных
                        console.log('[loadSavedConditions] Дополнительные состояния загружены из sessionStorage и установлены:', parsed);
                    } else {
                        console.log('[loadSavedConditions] Данные в sessionStorage некорректные, очищаем');
                        sessionStorage.removeItem('additionalConditions');
                        setAdditionalConditions({
                            faceId: null,
                            touchId: null,
                            backCamera: null,
                            battery: null
                        });
                    }
                    setLoadedFromDB(true);
                    return; // Не загружаем из БД, если есть в sessionStorage
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage:', e);
                    sessionStorage.removeItem('additionalConditions'); // Очищаем поврежденные данные
                }
            }
        }

        // Если нет данных в sessionStorage, загружаем из БД
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

                    // Проверяем статус заявки - если submitted, то НЕ загружаем старые состояния
                    if (data.status === 'submitted') {
                        console.log('Заявка уже отправлена, сбрасываем дополнительные состояния');
                        setAdditionalConditions({
                            faceId: null,
                            touchId: null,
                            backCamera: null,
                            battery: null
                        });
                        setHasChanges(false);
                        setLoadedFromDB(true);
                        return;
                    }

                    if (data.additionalConditions) {
                        // Проверяем, что это действительно новая заявка, а не старая
                        const hasOldData = data.additionalConditions.faceId ||
                            data.additionalConditions.touchId ||
                            data.additionalConditions.backCamera ||
                            data.additionalConditions.battery;

                        if (hasOldData) {
                            console.log('[loadSavedConditions] Найдены сохраненные дополнительные состояния, загружаем их:', data.additionalConditions);
                            // Проверяем, что данные корректные (не пустые строки или null)
                            const isValidData = data.additionalConditions.faceId &&
                                data.additionalConditions.touchId &&
                                data.additionalConditions.backCamera &&
                                data.additionalConditions.battery;

                            if (isValidData) {
                                setAdditionalConditions(data.additionalConditions);
                                setHasChanges(true); // Устанавливаем флаг изменений для загруженных из БД состояний
                                setShowHints(false); // Отключаем подсказки при загрузке данных
                                // Сохраняем в sessionStorage для быстрого доступа
                                sessionStorage.setItem('additionalConditions', JSON.stringify(data.additionalConditions));
                            } else {
                                console.log('[loadSavedConditions] Данные в БД некорректные, оставляем пустыми');
                                // Очищаем некорректные данные из БД
                                if (typeof window !== 'undefined') {
                                    sessionStorage.removeItem('additionalConditions');
                                }
                            }
                        } else {
                            console.log('[loadSavedConditions] Нет сохраненных дополнительных состояний, оставляем пустыми');
                            // НЕ сбрасываем состояния - они уже пустые по умолчанию
                        }
                    } else {
                        console.log('[loadSavedConditions] Нет дополнительных состояний в БД, оставляем пустыми');
                    }

                    setLoadedFromDB(true);
                } else {
                    console.log('Не удалось загрузить дополнительные состояния из БД');
                    setLoadedFromDB(true);
                }
            } catch (error) {
                console.error('Ошибка загрузки дополнительных состояний:', error);
                setLoadedFromDB(true);
            }
        } else {
            setLoadedFromDB(true);
        }
    }, [setAdditionalConditions, telegramId, checkIfAllSelected]);

    // Загружаем состояния при монтировании компонента
    useEffect(() => {
        console.log('[useEffect] Компонент смонтирован, telegramId:', telegramId);

        if (telegramId) {
            // Не загружаем состояния сразу - ждем создания заявки
        } else {
            // Сбрасываем состояния только если нет telegramId (для новых пользователей)
            setAdditionalConditions({
                faceId: null,
                touchId: null,
                backCamera: null,
                battery: null
            });
            setHasChanges(false);
            setLoadedFromDB(true); // Устанавливаем флаг загрузки для новых пользователей
        }
    }, [telegramId, setAdditionalConditions]);

    // Восстанавливаем состояния из sessionStorage при возврате на страницу (продолжение заявки)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('additionalConditions');

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('Продолжение заявки - восстановлены дополнительные состояния из sessionStorage:', parsed);
                    setAdditionalConditions(parsed);
                    setHasChanges(true); // Устанавливаем флаг изменений для восстановленных состояний
                    setShowHints(false); // Отключаем подсказки при загрузке данных
                    setLoadedFromDB(true); // Устанавливаем флаг загрузки
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage при возврате:', e);
                    sessionStorage.removeItem('additionalConditions');
                }
            }
        }

        // Устанавливаем флаг загрузки для новой заявки
        setLoadedFromDB(true);
    }, [setAdditionalConditions]); // Запускается только один раз при загрузке страницы

    // Проверяем, заполнены ли все состояния
    const areAllConditionsSelected = useCallback(() => {
        return additionalConditions.faceId &&
            additionalConditions.touchId &&
            additionalConditions.backCamera &&
            additionalConditions.battery;
    }, [additionalConditions]);

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
            let deviceConditionsData: {
                front?: string;
                back?: string;
                side?: string;
            } = {};
            if (deviceConditions) {
                deviceConditionsData = JSON.parse(deviceConditions);
            }

            // Рассчитываем штрафы за состояние устройства
            let totalPenalty = 0;

            // Штрафы за состояние экрана (из condition page)
            if (deviceConditionsData.front) {
                const frontCondition = getAdditionalConditionText(deviceConditionsData.front);
                if (frontCondition === 'Новый') totalPenalty += 0;
                else if (frontCondition === 'Очень хорошее') totalPenalty += -3;
                else if (frontCondition === 'Заметные царапины') totalPenalty += -8;
                else if (frontCondition === 'Трещины') totalPenalty += -15;
            }

            if (deviceConditionsData.back) {
                const backCondition = getAdditionalConditionText(deviceConditionsData.back);
                if (backCondition === 'Новый') totalPenalty += 0;
                else if (backCondition === 'Очень хорошее') totalPenalty += -3;
                else if (backCondition === 'Заметные царапины') totalPenalty += -8;
                else if (backCondition === 'Трещины') totalPenalty += -15;
            }

            if (deviceConditionsData.side) {
                const sideCondition = getAdditionalConditionText(deviceConditionsData.side);
                if (sideCondition === 'Новый') totalPenalty += 0;
                else if (sideCondition === 'Очень хорошее') totalPenalty += -3;
                else if (sideCondition === 'Заметные царапины') totalPenalty += -8;
                else if (sideCondition === 'Трещины') totalPenalty += -15;
            }

            // Штрафы за дополнительные условия
            if (additionalConditions.faceId) {
                if (additionalConditions.faceId === 'Работает') totalPenalty += 0;
                else if (additionalConditions.faceId === 'Не работает') totalPenalty += -10;
            }

            if (additionalConditions.touchId) {
                if (additionalConditions.touchId === 'Работает') totalPenalty += 0;
                else if (additionalConditions.touchId === 'Не работает') totalPenalty += -8;
            }

            if (additionalConditions.backCamera) {
                if (additionalConditions.backCamera === 'Новый') totalPenalty += 0;
                else if (additionalConditions.backCamera === 'Очень хорошее') totalPenalty += -3;
                else if (additionalConditions.backCamera === 'Заметные царапины') totalPenalty += -8;
                else if (additionalConditions.backCamera === 'Трещины') totalPenalty += -15;
            }

            if (additionalConditions.battery) {
                if (additionalConditions.battery === '95%') totalPenalty += 0;
                else if (additionalConditions.battery === '90%') totalPenalty += -2;
                else if (additionalConditions.battery === '85%') totalPenalty += -5;
                else if (additionalConditions.battery === '75%') totalPenalty += -10;
            }

            // Ограничиваем максимальный вычет 50%
            if (totalPenalty < -50) totalPenalty = -50;

            // Рассчитываем финальную цену
            const finalPrice = basePrice * (1 + totalPenalty / 100);

            // Ограничиваем минимальную цену 50% от базовой
            const minPrice = basePrice * 0.5;
            const result = Math.max(finalPrice, minPrice);

            console.log('💰 Расчет цены с дополнительными условиями:', {
                basePrice,
                totalPenalty,
                finalPrice: result,
                deviceConditions: deviceConditionsData,
                additionalConditions
            });

            console.log('💾 Сохраняем цену в sessionStorage:', result);

            // Обновляем цену в контексте
            setPrice(result);

            // Сохраняем в sessionStorage
            sessionStorage.setItem('price', JSON.stringify(result));
            sessionStorage.setItem('calculatedPrice', JSON.stringify(result));

        } catch (error) {
            console.error('Ошибка при расчете цены:', error);
        }
    }, [additionalConditions, setPrice]);

    // Показываем диалог когда все условия выбраны И пользователь делал изменения
    useEffect(() => {
        if (areAllConditionsSelected() && hasChanges) {
            console.log('[useEffect] Показываем диалог - все условия выбраны и есть изменения');
            
            // Рассчитываем цену перед показом диалога
            calculatePriceWithAdditionalConditions();
            
            setShowDialog(true);
            
            // Устанавливаем флаг "все выбрано"
            setIsAllSelected(true);
        }
    }, [additionalConditions, areAllConditionsSelected, hasChanges, calculatePriceWithAdditionalConditions]);

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
            console.log('[saveConditionsToDatabase] Сохраняю дополнительные состояния в БД:', newConditions);
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
                console.log('[saveConditionsToDatabase] Дополнительные состояния успешно сохранены в БД:', result);
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
        console.log(`[handleConditionSelect] Начало выбора ${type} с ID: ${conditionId}`);
        console.log(`[handleConditionSelect] Текущие состояния ДО выбора:`, additionalConditions);

        // Проверяем, можно ли выбрать этот тип
        if (!canSelectSection(type)) {
            console.log(`[handleConditionSelect] Нельзя выбрать ${type} сейчас`);
            return;
        }

        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Получаем текстовое описание состояния
        const conditionText = getAdditionalConditionText(conditionId);
        console.log(`[handleConditionSelect] Выбираю ${type}: ${conditionId} -> ${conditionText}`);

        // Проверяем, изменилось ли состояние
        if (additionalConditions[type] !== conditionText) {
            const newConditions = {
                ...additionalConditions,
                [type]: conditionText
            };

            console.log(`[handleConditionSelect] Новые условия для установки:`, newConditions);

            // Сначала обновляем контекст
            setAdditionalConditions(newConditions);

            // Сбрасываем режим редактирования при новом выборе
            setIsEditing(false);
            
            // Сбрасываем флаг "все выбрано" при изменении
            setIsAllSelected(false);

            // Сразу устанавливаем флаг изменений для мгновенного показа диалога
            setHasChanges(true);



            // Сохраняем в sessionStorage для быстрого восстановления
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('additionalConditions', JSON.stringify(newConditions));
                console.log(`[handleConditionSelect] Сохранено в sessionStorage:`, newConditions);
            }

            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        } else {
            console.log(`[handleConditionSelect] Состояние ${type} уже установлено как ${conditionText}. Изменений нет.`);
        }
    };

    // Проверяем, можно ли выбрать секцию
    const canSelectSection = (type: 'faceId' | 'touchId' | 'backCamera' | 'battery'): boolean => {
        if (type === 'backCamera') return true; // Задняя камера всегда доступна
        if (type === 'battery') return !!additionalConditions.backCamera; // Батарея только после выбора задней камеры
        if (type === 'faceId') return !!additionalConditions.battery; // Face ID только после выбора батареи
        if (type === 'touchId') return !!additionalConditions.faceId; // Touch ID только после выбора Face ID
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
                        const isSelected = additionalConditions[type] === condition.label;
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
        <Page back={true}>
            <ImagePreloader images={preloadImages} />
            <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
                {/* Прогресс-бар */}
                <div className="pt-6 pb-1">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
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
                        {additionalConditions.backCamera && (
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
                                    const isSelected = additionalConditions.battery === condition.label;
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
                        {additionalConditions.battery && (
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
                                            const isSelected = additionalConditions.faceId === condition.label;
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

                                        {/* Touch ID - показываем только после выбора Face ID */}
                                        {additionalConditions.faceId && touchIdConditions.map((condition) => {
                                            const isSelected = additionalConditions.touchId === condition.label;
                                            return (
                                                <motion.div key={condition.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
                                                    <Card className={`transition-all duration-200 relative border-0 shadow-none ${isSelected ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10' : ''} ${canSelectSection('touchId') ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}`} onClick={() => canSelectSection('touchId') && handleConditionSelect('touchId', condition.id)}>
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
                                {additionalConditions.faceId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Face ID:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {additionalConditions.faceId}
                                        </span>
                                    </div>
                                )}
                                {additionalConditions.touchId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Touch ID:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {additionalConditions.touchId}
                                        </span>
                                    </div>
                                )}
                                {additionalConditions.backCamera && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Задняя камера:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {additionalConditions.backCamera}
                                        </span>
                                    </div>
                                )}
                                {additionalConditions.battery && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Батарея:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {additionalConditions.battery}
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
