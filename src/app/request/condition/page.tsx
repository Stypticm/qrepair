'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';

import { useAppStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { ConditionOption, frontConditions, backConditions, sideConditions } from '@/core/lib/condition';
import { getPictureUrl } from '@/core/lib/assets';
import { Tooltip } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ImagePreloader } from '@/components/ImagePreloader/ImagePreloader';
import { useDevices, Device } from '@/hooks/useDevices';
import { getConditionImages } from '@/core/lib/imageUtils';

// Функция для поиска модели по названию
function findModelByName(modelname: string) {
    console.log('🔍 Condition page - findModelByName вызвана с modelname:', modelname);
    
    // Парсим название модели для извлечения параметров
    // Примеры: 
    // "iPhone 16 Pro 256GB Синий 2 SIM Китай" (Pro модель)
    // "iPhone 16 Pro Max 256GB Синий 2 SIM Китай" (Pro Max модель)
    // "iPhone 16 256GB Синий 2 SIM Китай" (базовая модель)
    const parts = modelname.split(' ');
    
    console.log('🔍 Condition page - parts после split:', parts);
    
    if (parts.length < 2) return null;
    
    const model = parts[2]; // "16" - модель находится на индексе 2
    let variant = ''; // По умолчанию пустая строка для базовых моделей
    let storageIndex = 3; // Индекс storage в массиве parts (по умолчанию для базовой модели)
    
    // Проверяем, есть ли вариант (R, S, S Max, Pro, Pro Max, mini, Plus, SE)
    // В названии "Apple iPhone 16 Pro 256GB..." индекс 3 это "Pro"
    if (parts[3] === 'R') {
        variant = 'R';
        storageIndex = 4; // storage находится на индексе 4
    } else if (parts[3] === 'S') {
        if (parts[4] === 'Max') {
            variant = 'S Max';
            storageIndex = 5; // storage находится на индексе 5
        } else {
            variant = 'S';
            storageIndex = 4; // storage находится на индексе 4
        }
    } else if (parts[3] === 'Pro') {
        if (parts[4] === 'Max') {
            variant = 'Pro Max';
            storageIndex = 5; // storage находится на индексе 5
        } else {
            variant = 'Pro';
            storageIndex = 4; // storage находится на индексе 4
        }
    } else if (parts[3] === 'mini') {
        variant = 'mini';
        storageIndex = 4; // storage находится на индексе 4
    } else if (parts[3] === 'Plus') {
        variant = 'Plus';
        storageIndex = 4; // storage находится на индексе 4
    } else if (parts[3] === 'SE') {
        variant = 'se';
        storageIndex = 4; // storage находится на индексе 4
    }
    
    const storage = parts[storageIndex]; // "256GB"
    const color = parts[storageIndex + 1]; // "Синий"
    const simType = parts[storageIndex + 2] + ' ' + parts[storageIndex + 3]; // "2 SIM"
    const country = parts[storageIndex + 4]; // "Китай"
    
    console.log('🔍 Condition page - извлеченные параметры:', {
        model,
        variant,
        storage,
        color,
        simType,
        country
    });
    
    // Маппинг цветов
    const colorMap: { [key: string]: string } = {
        'Золотой': 'G',
        'Красный': 'R', 
        'Синий': 'Bl',
        'Белый': 'Wh',
        'Черный': 'C'
    };
    
    // Маппинг стран
    const countryMap: { [key: string]: string } = {
        'Китай': 'Китай 🇨🇳',
        'США': 'США 🇺🇸',
        'Япония': 'Япония 🇯🇵'
    };
    
    const mappedColor = colorMap[color] || color;
    const mappedCountry = countryMap[country] || country;
    
    console.log('🔍 Condition page - маппированные параметры:', {
        model,
        variant,
        storage,
        color: mappedColor,
        simType,
        country: mappedCountry
    });
    
    // Получаем данные устройства из sessionStorage
    const phoneSelection = sessionStorage.getItem('phoneSelection');
    const deviceData = phoneSelection ? JSON.parse(phoneSelection) : null;
    
    if (deviceData) {
        console.log('✅ Condition page - найдены данные устройства:', deviceData);
        return deviceData;
    }
    
    console.log('❌ Condition page - данные устройства не найдены');
    return null;
}

export default function ConditionPage() {
    const { modelname, telegramId, deviceConditions, setDeviceConditions, username, setModel, setPrice, setCurrentStep } = useAppStore();
    const router = useRouter();
    const devices = useDevices();

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('condition');
    }, [setCurrentStep]);

    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);

    // Флаг для отслеживания загрузки состояний из БД
    const [loadedFromDB, setLoadedFromDB] = useState(false);

    // Состояние для режима редактирования
    const [isEditing, setIsEditing] = useState(false);
    
    // Состояние для определения, все ли выбрано
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Функция для проверки, все ли выбрано
    const checkIfAllSelected = useCallback((conditions: typeof deviceConditions) => {
        return conditions.front && conditions.back && conditions.side;
    }, [deviceConditions]);

    // Загрузка сохраненных состояний из sessionStorage или БД
    const loadSavedConditions = useCallback(async () => {
        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions');

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('Восстановлены состояния из sessionStorage:', parsed);
                    setDeviceConditions(parsed);
                    
                    // Проверяем, есть ли уже выбранные элементы (режим редактирования)
                    const hasSelectedItems = parsed.front || parsed.back || parsed.side;
                    if (hasSelectedItems) {
                        setIsEditing(true);
                        // Проверяем, все ли выбрано
                        const allSelected = checkIfAllSelected(parsed);
                        setIsAllSelected(!!allSelected);
                    }
                    
                    return; // Не загружаем из БД, если есть в sessionStorage
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage:', e);
                    sessionStorage.removeItem('deviceConditions'); // Очищаем поврежденные данные
                }
            }
        }

        // Если нет данных в sessionStorage, загружаем из БД
        try {
            const timestamp = Date.now();
            const url = `/api/request/getConditions?t=${timestamp}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ telegramId: telegramId || 'test-user' })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Загружены данные из БД:', data);

                // Проверяем статус заявки - если submitted, то НЕ загружаем старые состояния
                if (data.status === 'submitted') {
                    console.log('Заявка уже отправлена, сбрасываем состояния');
                    setDeviceConditions({
                        front: null,
                        back: null,
                        side: null
                    });
                    setHasChanges(false);
                    return;
                }

                // Обновляем состояния устройства только для черновиков
                if (data.deviceConditions && data.status !== 'submitted') {
                    // Проверяем, что это действительно новая заявка, а не старая
                    const hasOldData = data.deviceConditions.front || data.deviceConditions.back || data.deviceConditions.side;
                    if (hasOldData) {
                        console.log('Найдены сохраненные состояния, загружаем их:', data.deviceConditions);
                        setDeviceConditions(data.deviceConditions);
                        
                        // Проверяем, есть ли уже выбранные элементы (режим редактирования)
                        const hasSelectedItems = data.deviceConditions.front || data.deviceConditions.back || data.deviceConditions.side;
                        if (hasSelectedItems) {
                            setIsEditing(true);
                            // Проверяем, все ли выбрано
                            const allSelected = checkIfAllSelected(data.deviceConditions);
                            setIsAllSelected(!!allSelected);
                        }
                        
                        setHasChanges(true); // Устанавливаем флаг изменений для загруженных из БД состояний
                        setLoadedFromDB(true); // Устанавливаем флаг загрузки из БД
                    } else {
                        console.log('Нет сохраненных состояний, оставляем пустыми');
                        // НЕ сбрасываем состояния - они уже пустые по умолчанию
                        setLoadedFromDB(true); // Устанавливаем флаг загрузки из БД
                    }
                }

                // Дополнительная проверка: если в БД есть старые названия "Значительные царапины", заменяем их на "Заметные царапины"
                if (data.deviceConditions) {
                    const updatedConditions = { ...data.deviceConditions };
                    let hasChanges = false;

                    if (updatedConditions.front === 'Значительные царапины') {
                        updatedConditions.front = 'Заметные царапины';
                        hasChanges = true;
                    }
                    if (updatedConditions.back === 'Значительные царапины') {
                        updatedConditions.back = 'Заметные царапины';
                        hasChanges = true;
                    }
                    if (updatedConditions.side === 'Значительные царапины') {
                        updatedConditions.side = 'Заметные царапины';
                        hasChanges = true;
                    }

                    if (hasChanges) {
                        console.log('Обновляем старые названия состояний:', updatedConditions);
                        setDeviceConditions(updatedConditions);
                    }
                }

                // Обновляем модель если есть
                if (data.modelname) {
                    setModel(data.modelname);
                    console.log('Установлена модель:', data.modelname);
                }

                // Обновляем цену если есть
                if (data.price) {
                    setPrice(data.price);
                    console.log('Установлена цена:', data.price);
                }
            } else {
                console.log('Нет сохраненных данных в БД');
            }
        } catch (error) {
            console.error('Ошибка загрузки состояний из БД:', error);
        }
    }, [telegramId, setDeviceConditions, setModel, setPrice, checkIfAllSelected]);

    // Проверяем, все ли условия выбраны
    const isAllConditionsSelected = useCallback(() => {
        return deviceConditions.front && deviceConditions.back && deviceConditions.side;
    }, [deviceConditions]);

    // Состояние для диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Показываем диалог когда все условия выбраны И пользователь делал изменения
    useEffect(() => {
        if (isAllConditionsSelected() && hasChanges) {
            setShowDialog(true);
            
            // Устанавливаем флаг "все выбрано"
            setIsAllSelected(true);
        }
    }, [deviceConditions, isAllConditionsSelected, hasChanges]);

    // Создаем заявку при загрузке страницы (если её еще нет)
    useEffect(() => {
        const createRequest = async () => {
            if (telegramId) {
                try {
                    // Создаем заявку только если её нет
                    const response = await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                            currentStep: 'condition',
                        }),
                    });

                    if (response.ok) {
                        console.log('Заявка создана или найдена');

                        // НЕ сбрасываем состояния здесь - это делается только для действительно новых заявок
                        // Состояния будут загружены в loadSavedConditions() если они есть

                        // Очищаем sessionStorage только для новых заявок
                        if (typeof window !== 'undefined') {
                            const savedInSession = sessionStorage.getItem('deviceConditions');
                            if (!savedInSession) {
                                sessionStorage.removeItem('deviceConditions');
                                console.log('sessionStorage очищен для новой заявки');
                            }
                        }

                        // НЕ загружаем состояния из БД для новых заявок - это делается только для продолжения существующих
                        // Состояния уже установлены в первом useEffect на основе sessionStorage

                        // Устанавливаем флаг загрузки для новой заявки
                        setLoadedFromDB(true);
                    }
                } catch (error) {
                    console.error('Error creating request:', error);
                }
            }
        };

        createRequest();
    }, [telegramId, username, loadSavedConditions]);

    // Загружаем сохраненные состояния только после создания заявки
    useEffect(() => {
        if (telegramId) {
            // Не загружаем состояния сразу - ждем создания заявки
        } else {
            // Сбрасываем состояния только если нет telegramId (для новых пользователей)
            setDeviceConditions({
                front: null,
                back: null,
                side: null
            });
            setHasChanges(false);
            setLoadedFromDB(true); // Устанавливаем флаг загрузки для новых пользователей
        }
    }, [telegramId, setDeviceConditions]);

    // Восстанавливаем состояния из sessionStorage при возврате на страницу (продолжение заявки)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions');

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    console.log('Продолжение заявки - восстановлены состояния из sessionStorage:', parsed);
                    setDeviceConditions(parsed);
                    setHasChanges(true); // Устанавливаем флаг изменений для восстановленных состояний
                    setLoadedFromDB(true); // Устанавливаем флаг загрузки
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage при возврате:', e);
                    sessionStorage.removeItem('deviceConditions');
                }
            }
        }

        // Устанавливаем флаг загрузки для новой заявки
        setLoadedFromDB(true);
    }, [setDeviceConditions]); // Запускается только один раз при загрузке страницы


    // Обработчики диалогового окна
    const handleContinue = () => {
        // Сохраняем basePrice в sessionStorage для additional-condition страницы
        const savedBasePrice = sessionStorage.getItem('basePrice');
        if (savedBasePrice) {
            console.log('💾 Condition page - basePrice уже сохранена:', savedBasePrice);
        } else {
            console.log('❌ Condition page - basePrice не найдена в sessionStorage');
        }
        
        setShowDialog(false);
        router.push('/request/additional-condition');
    };

    const handleEdit = () => {
        setShowDialog(false);
        // При редактировании сбрасываем флаг изменений
        setHasChanges(false);
    };

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
            const newConditions = {
                ...deviceConditions,
                [type]: conditionText
            };

            console.log('🔄 Condition page - handleConditionSelect:', {
                type,
                conditionId,
                conditionText,
                oldConditions: deviceConditions,
                newConditions
            });

            // Сначала обновляем контекст
            setDeviceConditions(newConditions);

            // Сбрасываем режим редактирования при новом выборе
            setIsEditing(false);
            
            // Сбрасываем флаг "все выбрано" при изменении
            setIsAllSelected(false);

            // Устанавливаем флаг изменений
            setHasChanges(true);

            // Сохраняем в sessionStorage для быстрого восстановления
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('deviceConditions', JSON.stringify(newConditions));
                console.log('Состояния сохранены в sessionStorage:', newConditions);
            }

            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        }
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        console.log('🚀 Condition page - saveConditionsToDatabase вызвана с:', newConditions);
        console.log('🔍 Condition page - текущий modelname из контекста:', modelname);
        try {
            // Получаем базовую цену из найденной модели
            let basePrice = 0; // Базовая цена по умолчанию
            console.log('🔍 Condition page - modelname:', modelname);
            if (modelname) {
                // Получаем данные устройства из sessionStorage
                const phoneSelection = sessionStorage.getItem('phoneSelection');
                const foundModel = phoneSelection ? JSON.parse(phoneSelection) : null;
                console.log('🔍 Condition page - foundModel:', foundModel);
                if (foundModel) {
                    basePrice = foundModel.basePrice;
                    console.log('✅ Condition page - basePrice установлена:', basePrice);
                } else {
                    console.log('❌ Condition page - модель не найдена, basePrice = 0');
                }
            } else {
                console.log('❌ Condition page - modelname пустой, basePrice = 0');
            }

            // Рассчитываем финальную цену с учетом состояний
            const finalPrice = calculateFinalPrice(basePrice, newConditions);
            const discountAmount = basePrice - finalPrice;
            const discountPercent = basePrice > 0 ? (discountAmount / basePrice * 100) : 0;
            
            console.log('🔍 Condition page - finalPrice рассчитана:', finalPrice);
            console.log('💰 Condition page - разница в цене:', discountAmount, '₽');
            console.log('📊 Condition page - процент скидки:', discountPercent.toFixed(1) + '%');

            // Устанавливаем цену в контекст
            setPrice(finalPrice);

            // Сохраняем цену в sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('price', JSON.stringify(finalPrice));
                console.log('✅ Condition page - цена сохранена в sessionStorage:', finalPrice);
            }

            const requestBody = {
                deviceConditions: newConditions,
                price: finalPrice, // Финальная цена (для совместимости)
                basePrice: basePrice, // Базовая цена без поломок
                discountPercent: discountPercent, // Процент скидки
                currentStep: 'condition',
                telegramId: telegramId || 'test-user'
            };

            console.log('🚀 Condition page - отправляем в API /saveConditions:', {
                basePrice,
                finalPrice,
                discountPercent: discountPercent.toFixed(1) + '%',
                deviceConditions: newConditions,
                priceDifference: discountAmount
            });

            const response = await fetch('/api/request/saveConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                console.error('Ошибка сохранения состояний в БД:', response.status);
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
            return 'Заметные\nцарапины';
        } else if (conditionId.includes('_scratches')) {
            return 'Трещины';
        } else if (conditionId === 'display_front' || conditionId === 'display_back' || conditionId === 'display_side') {
            return 'Очень\nхорошее';
        } else {
            return conditionId; // fallback
        }
    };

    // Шаги для прогресс-бара
    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        // Показываем шаг 3 на странице condition
        return 3;
    };
    const getConditionPenalty = (conditionId: string): number => {
        if (conditionId.includes('_new')) {
            return 0;
        } else if (conditionId.includes('_have_scratches')) {
            return -8;
        } else if (conditionId.includes('_scratches')) {
            return -15;
        } else if (conditionId.includes('display_front') || conditionId.includes('display_back') || conditionId.includes('display_side')) {
            return -3;
        } else {
            return 0; // fallback
        }
    };

    // Функция для расчета финальной цены с учетом состояний
    const calculateFinalPrice = (basePrice: number, conditions: any = deviceConditions): number => {
        let totalPenalty = 0;

        console.log('🔍 Condition page - calculateFinalPrice начальные данные:', {
            basePrice,
            conditions
        });

        // Суммируем проценты по всем выбранным состояниям
        if (conditions.front) {
            console.log('🔍 Condition page - ищем front condition:', {
                lookingFor: conditions.front,
                allFrontConditions: frontConditions.map(c => ({ id: c.id, label: c.label, penalty: c.penalty }))
            });
            
            const frontCondition = frontConditions.find(c => getConditionText(c.id) === conditions.front);
            if (frontCondition) {
                totalPenalty += frontCondition.penalty;
                console.log('✅ Condition page - front condition найдено:', {
                    condition: conditions.front,
                    penalty: frontCondition.penalty,
                    totalPenalty
                });
            } else {
                console.log('❌ Condition page - front condition не найдено:', {
                    condition: conditions.front,
                    availableConditions: frontConditions.map(c => getConditionText(c.id))
                });
            }
        }
        if (conditions.back) {
            const backCondition = backConditions.find(c => getConditionText(c.id) === conditions.back);
            if (backCondition) {
                totalPenalty += backCondition.penalty;
                console.log('🔍 Condition page - back condition:', {
                    condition: conditions.back,
                    penalty: backCondition.penalty,
                    totalPenalty
                });
            } else {
                console.log('❌ Condition page - back condition не найдено:', {
                    condition: conditions.back,
                    availableConditions: backConditions.map(c => getConditionText(c.id))
                });
            }
        }
        if (conditions.side) {
            const sideCondition = sideConditions.find(c => getConditionText(c.id) === conditions.side);
            if (sideCondition) {
                totalPenalty += sideCondition.penalty;
                console.log('🔍 Condition page - side condition:', {
                    condition: conditions.side,
                    penalty: sideCondition.penalty,
                    totalPenalty
                });
            } else {
                console.log('❌ Condition page - side condition не найдено:', {
                    condition: conditions.side,
                    availableConditions: sideConditions.map(c => getConditionText(c.id))
                });
            }
        }

        // Ограничиваем максимальный вычет 50%
        if (totalPenalty < -50) totalPenalty = -50;

        // Рассчитываем финальную цену
        const finalPrice = basePrice * (1 + totalPenalty / 100);

        // Ограничиваем минимальную цену 50% от базовой
        const minPrice = basePrice * 0.5;
        const result = Math.max(finalPrice, minPrice);

        console.log('🔍 Condition page - calculateFinalPrice результат:', {
            basePrice,
            totalPenalty,
            calculation: `${basePrice} * (1 + ${totalPenalty}/100) = ${basePrice} * ${(1 + totalPenalty / 100)} = ${finalPrice}`,
            minPrice,
            finalPrice: result
        });

        return result;
    };

    // Функция для расчета общего процента вычета (для диалога)
    const calculateTotalPenalty = (): number => {
        let totalPenalty = 0;

        if (deviceConditions.front) {
            if (deviceConditions.front === 'Новый') totalPenalty += 0;
            else if (deviceConditions.front === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.front === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.front === 'Трещины') totalPenalty += -15;
        }

        if (deviceConditions.back) {
            if (deviceConditions.back === 'Новый') totalPenalty += 0;
            else if (deviceConditions.back === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.back === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.back === 'Трещины') totalPenalty += -15;
        }

        if (deviceConditions.side) {
            if (deviceConditions.side === 'Новый') totalPenalty += 0;
            else if (deviceConditions.side === 'Очень хорошее') totalPenalty += -3;
            else if (deviceConditions.side === 'Заметные царапины') totalPenalty += -8;
            else if (deviceConditions.side === 'Трещины') totalPenalty += -15;
        }

        return totalPenalty;
    };

    // Проверяем, можно ли выбрать секцию
    const canSelectSection = (type: 'front' | 'back' | 'side'): boolean => {
        if (type === 'front') return true; // Передняя часть всегда доступна
        if (type === 'back') return !!deviceConditions.front; // Задняя только после выбора передней
        if (type === 'side') return !!deviceConditions.front && !!deviceConditions.back; // Боковые только после выбора обеих панелей
        return false;
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
                return 'w-17 h-31 rounded-lg';
            }
        };



        return (
            <div className="space-y-1">
                {/* Заголовок секции */}
                <h3 className="text-lg font-semibold text-center">
                    {type === 'front' ? 'Передняя часть' : type === 'back' ? 'Задняя панель' : 'Боковые грани'}
                    {!canSelectSection(type) && (
                        <span className="block text-sm text-gray-500 font-normal mt-1">
                            {type === 'back' ? 'Сначала выберите переднюю часть' : 'Сначала выберите переднюю и заднюю части'}
                        </span>
                    )}
                </h3>

                {/* Сетка вариантов */}
                <div className="grid grid-cols-4 gap-2">
                    {conditions.map((condition) => (
                        <motion.div
                            key={condition.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Card
                                className={`transition-all duration-200 relative border-0 shadow-none ${deviceConditions[type] === getConditionText(condition.id)
                                        ? 'ring-2 ring-[#2dc2c6] bg-[#2dc2c6]/10'
                                        : ''
                                    } ${canSelectSection(type)
                                        ? 'cursor-pointer hover:shadow-md'
                                        : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => canSelectSection(type) && handleConditionSelect(type, condition.id)}
                            >
                                {deviceConditions[type] === getConditionText(condition.id) && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                )}
                                <CardContent className="p-1 pb-1 flex flex-col items-center justify-center">
                                    {/* Изображение - разные размеры для разных секций */}
                                    <motion.div 
                                        className={`relative ${getImageStyle()} overflow-hidden bg-gray-100`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <Image
                                            src={getPictureUrl(`${condition.image}.png`) || `/${condition.image}.png`}
                                            alt={condition.label}
                                            fill
                                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                            loading="eager"
                                            priority={false}
                                        />
                                    </motion.div>

                                    {/* Название условия */}
                                    <h4 className="text-xs font-medium text-gray-900 text-center leading-tight whitespace-pre-line mt-0.5">
                                        {condition.label}
                                    </h4>


                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // Список изображений для предзагрузки (только те, что не были предзагружены на главной)
    const preloadImages = getConditionImages();

    return (
        <Page back={true}>
            <ImagePreloader images={preloadImages} />
            <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col request-page">
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

                        {/* Секция передней части экрана */}
                        {true && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm"
                            >
                                {renderConditionSection('front', frontConditions)}
                            </motion.div>
                        )}

                        {/* Секция задней панели */}
                        {deviceConditions.front && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 rounded-xl shadow-sm bg-white"
                            >
                                {renderConditionSection('back', backConditions)}
                            </motion.div>
                        )}

                        {/* Секция боковых граней */}
                        {deviceConditions.back && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 rounded-xl shadow-sm bg-white"
                            >
                                {renderConditionSection('side', sideConditions)}
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
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">

                    </DialogTitle>

                    <div className="text-center">
                        {/* Рамка для выбранных условий */}
                        <div className="bg-[#2dc2c6]/10 rounded-2xl p-5 border border-[#2dc2c6] shadow-lg mb-4">
                            <div className="space-y-3">
                                {deviceConditions.front && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Передняя панель:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {deviceConditions.front}
                                        </span>
                                    </div>
                                )}
                                {deviceConditions.back && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Задняя панель:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {deviceConditions.back}
                                        </span>
                                    </div>
                                )}
                                {deviceConditions.side && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Боковые грани:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {deviceConditions.side}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Показываем выбранные условия */}



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
