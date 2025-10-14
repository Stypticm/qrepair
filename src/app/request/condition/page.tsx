'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Page } from '@/components/Page';

import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { ConditionOption, frontConditions, backConditions, sideConditions } from '@/core/lib/condition';
import { getPictureUrl } from '@/core/lib/assets';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ImagePreloader } from '@/components/ImagePreloader/ImagePreloader';
import { getConditionImages } from '@/core/lib/imageUtils';

const SURFACE_ORDER = ['front', 'back', 'side'] as const;
type SurfaceKey = typeof SURFACE_ORDER[number];

const SURFACE_META: Record<SurfaceKey, { title: string; subtitle: string; accent: string }> = {
    front: {
        title: 'Лицевая сторона',
        subtitle: 'Экран и рамка дисплея',
        accent: 'Front',
    },
    back: {
        title: 'Задняя часть',
        subtitle: 'Спинка и блок камер',
        accent: 'Back',
    },
    side: {
        title: 'Грани и кнопки',
        subtitle: 'Боковые поверхности',
        accent: 'Sides',
    },
};

// Функция для поиска модели по названию
function findModelByName(modelname: string) {
    
    // Парсим название модели для извлечения параметров
    // Примеры: 
    // "iPhone 16 Pro 256GB Синий 2 SIM Китай" (Pro модель)
    // "iPhone 16 Pro Max 256GB Синий 2 SIM Китай" (Pro Max модель)
    // "iPhone 16 256GB Синий 2 SIM Китай" (базовая модель)
    const parts = modelname.split(' ');
    
    
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
    
    // Получаем данные устройства из sessionStorage
    const phoneSelection = sessionStorage.getItem('phoneSelection');
    const deviceData = phoneSelection ? JSON.parse(phoneSelection) : null;
    
    if (deviceData) {
        return deviceData;
    }
    
    return null;
}

export default function ConditionPage() {
    const {
        modelname,
        telegramId,
        deviceConditions,
        setDeviceConditions,
        username,
        setModel,
        setPrice,
        setCurrentStep,
        price,
    } = useAppStore();
    const router = useRouter();

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('condition');
    }, [setCurrentStep]);

    // Состояние для отслеживания изменений
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedBasePrice = sessionStorage.getItem('basePrice');
        if (!storedBasePrice) return;
        const parsedBase = Number(storedBasePrice);
        if (!Number.isNaN(parsedBase)) {
            setBasePrice(parsedBase);
        }
    }, []);

    useEffect(() => {
        setIsAllSelected(checkIfAllSelected(deviceConditions));

        if (hasUserInteracted) {
            return;
        }

        const nextSurface = SURFACE_ORDER.find((surface) => !deviceConditions[surface]);
        if (nextSurface && nextSurface !== activeSurface) {
            setActiveSurface(nextSurface);
        }
    }, [deviceConditions, checkIfAllSelected, hasUserInteracted, activeSurface]);

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
    }, []);

    const initialSurface: SurfaceKey =
        !deviceConditions.front
            ? 'front'
            : !deviceConditions.back
                ? 'back'
                : !deviceConditions.side
                    ? 'side'
                    : 'front';

    const [activeSurface, setActiveSurface] = useState<SurfaceKey>(initialSurface);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [basePrice, setBasePrice] = useState<number | null>(null);

    const handleSurfaceChange = (surface: SurfaceKey) => {
        setActiveSurface(surface);
        setHasUserInteracted(true);
    };

    const getOptionsBySurface = useCallback(
        (surface: SurfaceKey): ConditionOption[] => {
            switch (surface) {
                case 'front':
                    return frontConditions;
                case 'back':
                    return backConditions;
                case 'side':
                    return sideConditions;
                default:
                    return frontConditions;
            }
        },
        []
    );

    const getOptionByLabel = useCallback(
        (surface: SurfaceKey, label: string | null) => {
            if (!label) return null;
            return (
                getOptionsBySurface(surface).find(
                    (option) => getConditionText(option.id) === label
                ) || null
            );
        },
        [getOptionsBySurface]
    );

    const currentOptions = useMemo(
        () => getOptionsBySurface(activeSurface),
        [activeSurface, getOptionsBySurface]
    );

    const currentSelection = useMemo(() => {
        const existing = getOptionByLabel(activeSurface, deviceConditions[activeSurface]);
        if (existing) return existing;
        return currentOptions[0] ?? null;
    }, [activeSurface, currentOptions, deviceConditions, getOptionByLabel]);

    const previewImage = useMemo(() => {
        const imageKey = currentSelection?.image ?? currentOptions[0]?.image;
        return imageKey ? getPictureUrl(`${imageKey}.png`) : '';
    }, [currentSelection, currentOptions]);

    const totalPenalty = useMemo(() => calculateTotalPenalty(), [deviceConditions]);

    const estimatedPrice = useMemo(() => {
        if (price && price > 0) return price;
        if (basePrice && basePrice > 0) {
            return calculateFinalPrice(basePrice, deviceConditions);
        }
        return null;
    }, [basePrice, deviceConditions, price]);

    const priceFormatter = useMemo(
        () =>
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
            }),
        []
    );

    const isReadyToContinue = Boolean(
        deviceConditions.front && deviceConditions.back && deviceConditions.side
    );

    // Загрузка сохраненных состояний из sessionStorage или БД
    const loadSavedConditions = useCallback(async () => {
        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions');

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
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

                // Проверяем статус заявки - если submitted, то НЕ загружаем старые состояния
                if (data.status === 'submitted') {
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
                        setDeviceConditions(updatedConditions);
                    }
                }

                // Обновляем модель если есть
                if (data.modelname) {
                    setModel(data.modelname);
                }

                // Обновляем цену если есть
                if (data.price) {
                    setPrice(data.price);
                }
            } else {
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

                        // НЕ сбрасываем состояния здесь - это делается только для действительно новых заявок
                        // Состояния будут загружены в loadSavedConditions() если они есть

                        // Очищаем sessionStorage только для новых заявок
                        if (typeof window !== 'undefined') {
                            const savedInSession = sessionStorage.getItem('deviceConditions');
                            if (!savedInSession) {
                                sessionStorage.removeItem('deviceConditions');
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
        } else {
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

        setHasUserInteracted(true)

        // Получаем текстовое описание состояния
        const conditionText = getConditionText(conditionId);

        // Проверяем, изменилось ли состояние
        if (deviceConditions[type] !== conditionText) {
            const newConditions = {
                ...deviceConditions,
                [type]: conditionText
                };

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
            }

            // Затем сохраняем состояния в БД
            saveConditionsToDatabase(newConditions);
        }
    };

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        try {
            // Получаем базовую цену из найденной модели
            let basePrice = 0; // Базовая цена по умолчанию
            if (modelname) {
                // Получаем данные устройства из sessionStorage
                const phoneSelection = sessionStorage.getItem('phoneSelection');
                const foundModel = phoneSelection ? JSON.parse(phoneSelection) : null;
                if (foundModel) {
                    basePrice = foundModel.basePrice;
                } else {
                }
            } else {
            }

            // Рассчитываем финальную цену с учетом состояний
            const finalPrice = calculateFinalPrice(basePrice, newConditions);
            const discountAmount = basePrice - finalPrice;
            const discountPercent = basePrice > 0 ? (discountAmount / basePrice * 100) : 0;
            

            // Устанавливаем цену в контекст
            setPrice(finalPrice);

            // Сохраняем цену в sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('price', JSON.stringify(finalPrice));
            }

            const requestBody = {
                deviceConditions: newConditions,
                price: finalPrice, // Финальная цена (для совместимости)
                basePrice: basePrice, // Базовая цена без поломок
                discountPercent: discountPercent, // Процент скидки
                currentStep: 'condition',
                telegramId: telegramId || 'test-user'
            };

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

        // Суммируем проценты по всем выбранным состояниям
        if (conditions.front) {
            const frontCondition = frontConditions.find(c => getConditionText(c.id) === conditions.front);
            if (frontCondition) {
                totalPenalty += frontCondition.penalty;
            }
        }
        if (conditions.back) {
            const backCondition = backConditions.find(c => getConditionText(c.id) === conditions.back);
            if (backCondition) {
                totalPenalty += backCondition.penalty;
            }
        }
        if (conditions.side) {
            const sideCondition = sideConditions.find(c => getConditionText(c.id) === conditions.side);
            if (sideCondition) {
                totalPenalty += sideCondition.penalty;
            }
        }

        // Ограничиваем максимальный вычет 50%
        if (totalPenalty < -50) totalPenalty = -50;

        // Рассчитываем финальную цену
        const finalPrice = basePrice * (1 + totalPenalty / 100);

        // Ограничиваем минимальную цену 50% от базовой
        const minPrice = basePrice * 0.5;
        const result = Math.max(finalPrice, minPrice);

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

    
    const preloadImages = getConditionImages();

    return (
        <Page back={true}>
            <ImagePreloader images={preloadImages} />
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-12 md:px-8">
                    <div className="mb-6">
                        <ProgressBar
                            currentStep={getCurrentStep()}
                            totalSteps={5}
                            steps={steps}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mb-8 space-y-3 text-center md:text-left"
                    >
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Оценка состояния
                        </span>
                        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                            Как выглядит ваш Iphone сегодня
                        </h1>
                        <p className="text-sm text-slate-500 md:text-base">
                            ??Оценка состояния ????Не выбрано ? ?Не выбрано ??? Оценка состояния? ??Оценка состояния.
                        </p>
                    </motion.div>

                    <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                        <div className="grid grid-cols-1 gap-4 lg:w-[280px]">
                            {SURFACE_ORDER.map((surface) => {
                                const option = getOptionByLabel(surface, deviceConditions[surface]);
                                const isActive = activeSurface === surface;
                                const isComplete = Boolean(option);
                                return (
                                    <button
                                        key={surface}
                                        type="button"
                                        onClick={() => handleSurfaceChange(surface)}
                                        className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.6)]'
                                                : 'border-white/70 bg-white/70 text-slate-900 shadow-sm hover:border-slate-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <span className={`text-[10px] uppercase tracking-[0.25em] ${
                                                    isActive ? 'text-white/70' : 'text-slate-400'
                                                }`}>
                                                    {SURFACE_META[surface].accent}
                                                </span>
                                                <p className="mt-1 text-sm font-medium">
                                                    {SURFACE_META[surface].title}
                                                </p>
                                            </div>
                                            <span
                                                className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                                                    isComplete
                                                        ? isActive
                                                            ? 'border-white/40 bg-white/20 text-white'
                                                            : 'border-slate-200 bg-white text-slate-700'
                                                        : 'border-amber-200 bg-amber-50 text-amber-600'
                                                }`}
                                            >
                                                {isComplete ? 'OK' : '!'}
                                            </span>
                                        </div>
                                        <p className={`mt-3 text-xs leading-5 ${
                                            isActive ? 'text-white/80' : 'text-slate-500'
                                        }`}>
                                            {option ? getConditionText(option.id) : 'Не выбрано'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1 space-y-6">
                            <motion.div
                                key={activeSurface}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                                            {SURFACE_META[activeSurface].accent}
                                        </span>
                                        <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                                            {SURFACE_META[activeSurface].title}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {SURFACE_META[activeSurface].subtitle}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 p-1 shadow-sm">
                                        {SURFACE_ORDER.map((surface) => {
                                            const isActiveTab = activeSurface === surface;
                                            const completed = Boolean(deviceConditions[surface]);
                                            return (
                                                <button
                                                    key={`${surface}-tab`}
                                                    type="button"
                                                    onClick={() => handleSurfaceChange(surface)}
                                                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                                                        isActiveTab
                                                            ? 'bg-slate-900 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.55)]'
                                                            : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                >
                                                    <span>{SURFACE_META[surface].accent}</span>
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            completed
                                                                ? isActiveTab
                                                                    ? 'bg-emerald-300'
                                                                    : 'bg-emerald-500/70'
                                                                : 'bg-amber-400'
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:items-end">
                                    <div className="relative flex w-full justify-center md:w-1/2">
                                        {previewImage ? (
                                            <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-inner">
                                                <Image
                                                    src={previewImage}
                                                    alt={currentSelection ? getConditionText(currentSelection.id) : '?Оценка состояния Оценка??'}
                                                    width={320}
                                                    height={560}
                                                    priority={activeSurface === 'front'}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[9/16] w-full max-w-[260px] rounded-[32px] border border-dashed border-slate-300 bg-white/60" />
                                        )}
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-inner backdrop-blur">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">?Оценка состояния</p>
                                            <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                                {currentSelection ? getConditionText(currentSelection.id) : 'Не выбрано'}
                                            </h3>
                                            <p className="mt-3 text-sm text-slate-500">
                                                {currentSelection?.penalty === 0
                                                    ? '??Не выбрано?? ?Не выбрано??.'
                                                    : `Оценка?Оценка состояния: ${currentSelection?.penalty}%`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {currentOptions.map((option) => {
                                    const optionLabel = getConditionText(option.id);
                                    const isSelected = deviceConditions[activeSurface] === optionLabel;
                                    const penaltyLabel = option.penalty === 0 ? '0%' : `${option.penalty}%`;
                                    const imageSrc = getPictureUrl(`${option.image}.png`);
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleConditionSelect(activeSurface, option.id)}
                                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                                                isSelected
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.55)]'
                                                    : 'border-white/70 bg-white text-slate-900 shadow-sm hover:border-slate-200 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="relative flex flex-col items-center gap-3 px-3 py-4">
                                                <div className={`relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border transition ${
                                                    isSelected
                                                        ? 'border-white/30 bg-white/10'
                                                        : 'border-slate-200 bg-slate-100'
                                                }`}>
                                                    <Image
                                                        src={imageSrc}
                                                        alt={optionLabel}
                                                        width={200}
                                                        height={200}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <span className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                                                    }`}>
                                                        {penaltyLabel}
                                                    </span>
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                        {optionLabel}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 border-t border-white/70 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">??Оценка состояния????</p>
                            <div className="mt-2 flex items-baseline gap-3">
                                <span className="text-2xl font-semibold text-slate-900">
                                    {totalPenalty > 0 ? `+${totalPenalty}%` : `${totalPenalty}%`}
                                </span>
                                {estimatedPrice ? (
                                    <span className="text-sm text-slate-500">
                                        ? {priceFormatter.format(estimatedPrice)}
                                    </span>
                                ) : null}
                            </div>
                            {basePrice && estimatedPrice ? (
                                <p className="mt-2 text-xs text-slate-500">
                                    Оценка? ???? {priceFormatter.format(basePrice)}
                                </p>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            disabled={!isReadyToContinue}
                            onClick={() => setShowDialog(true)}
                            className="h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none md:w-auto md:px-10"
                        >
                            Оценка????
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-center text-2xl font-semibold text-slate-900">
                            Оценка?? ?????
                        </DialogTitle>
                        <p className="text-center text-sm text-slate-500">
                            ?Не выбрано??Не выбрано?. Оценка? ? ОценкаНе выбрано?
                        </p>
                    </DialogHeader>
                    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
                        {SURFACE_ORDER.map((surface) => {
                            const option = getOptionByLabel(surface, deviceConditions[surface]);
                            return (
                                <div key={`${surface}-review`} className="flex items-center justify-between gap-3">
                                    <span className="font-medium text-slate-500">{SURFACE_META[surface].title}</span>
                                    <span className="text-slate-900">
                                        {option ? getConditionText(option.id) : 'Не выбрано'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {estimatedPrice && basePrice ? (
                        <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm">
                            <span className="text-slate-500">Оценка</span>
                            <span className="font-semibold text-slate-900">
                                {priceFormatter.format(estimatedPrice)}
                            </span>
                        </div>
                    ) : null}
                    <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 flex-1 rounded-full border-slate-200 text-slate-700"
                            onClick={() => setShowDialog(false)}
                        >
                            Оценка??
                        </Button>
                        <Button
                            type="button"
                            className="h-11 flex-1 rounded-full bg-slate-900 text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.65)] transition hover:bg-slate-800"
                            onClick={handleContinue}
                        >
                            Оценка????
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
