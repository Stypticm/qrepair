'use client'

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useDevices, Device } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { WelcomeModal } from '@/components/ui/welcome-modal';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tooltip } from '@/components/ui/tooltip';
import { getPictureUrl } from '@/core/lib/assets';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import Image from 'next/image';

export default function FormPage() {
    const { modelname, setModel, telegramId, username, setPrice, setCurrentStep } = useAppStore();
    const router = useRouter();
    const devices = useDevices();

    // Проверяем, доступен ли Telegram WebApp API
    const isTelegramWebApp = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('form');
    }, [setCurrentStep]);

    // Загружаем модели при инициализации
    useEffect(() => {
        devices.loadModels();
    }, [devices.loadModels]);

    // Отладочная информация о загруженных моделях
    useEffect(() => {
    }, [devices.models, devices.loading]);

    // Сбрасываем все состояния при загрузке страницы (только если это новая заявка)
    useEffect(() => {
        // Логируем для отладки

        // Проверяем, есть ли сохраненные данные в sessionStorage
        const savedData = sessionStorage.getItem('phoneSelection');
        if (!savedData) {
            // Только если нет сохраненных данных - сбрасываем состояния
            // Сбрасываем только основные состояния, не вызывая resetAllStates
            setModel('Apple iPhone 11');
            // Очищаем sessionStorage для новой заявки
            sessionStorage.removeItem('phoneSelection');

            // Приветственный экран теперь показывается на device-info странице
        } else {
        }
    }, [isTelegramWebApp, telegramId, setModel]); // Добавляем setModel в зависимости

    // Инициализируем состояние
    const [selectedOptions, setSelectedOptions] = useState({
        model: '',
        variant: null, // Изменяем на null чтобы не было предвыбора
        storage: '',
        color: ''
    });

    // Загружаем данные при изменении фильтров
    useEffect(() => {
        if (selectedOptions.model) {
            devices.loadVariants(selectedOptions.model);
        }
    }, [selectedOptions.model, devices.loadVariants]);

    useEffect(() => {
        if (selectedOptions.model && selectedOptions.variant !== null && selectedOptions.variant !== undefined) {
            devices.loadStorages({
                model: selectedOptions.model,
                variant: selectedOptions.variant
            });
        }
    }, [selectedOptions.model, selectedOptions.variant, devices.loadStorages]);

    useEffect(() => {
        if (selectedOptions.model && selectedOptions.variant !== null && selectedOptions.variant !== undefined && selectedOptions.storage) {
            devices.loadColors({
                model: selectedOptions.model,
                variant: selectedOptions.variant || '',
                storage: selectedOptions.storage
            });
        }
    }, [selectedOptions.model, selectedOptions.variant, selectedOptions.storage, devices.loadColors]);

    // Убрали загрузку типов SIM

    // Убрали загрузку стран

    // Состояние для отображения текущего выбора в центре
    const [currentSelection, setCurrentSelection] = useState<string>('');

    // Состояние для режима редактирования
    const [isEditing, setIsEditing] = useState(false);

    // Состояние для определения, все ли выбрано
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Функция для проверки, все ли выбрано
    const checkIfAllSelected = useCallback((options: typeof selectedOptions) => {
        return options.model && options.variant !== null && options.variant !== undefined && options.storage && options.color;
    }, []);

    // Функция для обновления текущего выбора
    const updateCurrentSelection = useCallback((options: typeof selectedOptions) => {
        let selection = '';

        if (options.model) {
            selection = `iPhone ${options.model}`;
        }

        if (options.variant !== null && options.variant !== undefined && options.variant !== '') {
            // Показываем вариант только если он не пустой
            selection += ` ${getVariantLabel(options.variant)}`;
        }

        if (options.storage) {
            selection += ` ${options.storage}`;
        }

        if (options.color) {
            selection += ` ${getColorLabel(options.color)}`;
        }

        // simType и country убраны

        setCurrentSelection(selection);

        // Проверяем, все ли выбрано
        const allSelected = checkIfAllSelected(options);
        setIsAllSelected(!!allSelected);
    }, [checkIfAllSelected]);

    // Функция для определения, какую секцию показывать в режиме редактирования
    const getCurrentEditingSection = () => {
        if (!selectedOptions.model) return 'model';
        if (!selectedOptions.variant) return 'variant';
        if (!selectedOptions.storage) return 'storage';
        if (!selectedOptions.color) return 'color';
        
        return null; // все выбрано
    };



    // Состояние для диалогового окна
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    
    // Отладочный лог для состояния диалога
    useEffect(() => {
        console.log('🔍 Dialog state changed - showSummaryDialog:', showSummaryDialog);
    }, [showSummaryDialog]);



    // Шаги для прогресс-бара
    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];


    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        // Всегда показываем шаг 2 на странице form
        return 2;
    };




    const handleOptionSelect = (type: keyof typeof selectedOptions, value: string) => {

        // Вибрация при выборе
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Обрабатываем пустую строку как пустой вариант
        const processedValue = value;
        const newOptions = {
            ...selectedOptions,
            [type]: selectedOptions[type] === processedValue ? '' : processedValue
        };


        // Сбрасываем зависимые параметры
        if (type === 'model') {
            newOptions.variant = null;
            newOptions.storage = '';
            newOptions.color = '';
            devices.clearFilters();
        } else if (type === 'variant') {
            newOptions.storage = '';
            newOptions.color = '';
        } else if (type === 'storage') {
            newOptions.color = '';
        } 

        setSelectedOptions(newOptions);

        // Сбрасываем режим редактирования при новом выборе
        setIsEditing(false);

        // Сбрасываем флаг "все выбрано" при изменении
        setIsAllSelected(false);

        // Обновляем текущий выбор для отображения в центре
        updateCurrentSelection(newOptions);

        // Сохраняем в sessionStorage для быстрого восстановления
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('phoneSelection', JSON.stringify(newOptions));
        }

        // Проверяем, доступен ли Telegram WebApp API
        const isTelegramWebApp = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

        if (isTelegramWebApp) {
            // Сохраняем в CloudStorage для сохранения между страницами
            callTelegramMethod('web_app_cloud_storage_set', {
                key: 'phoneSelection',
                value: JSON.stringify({ data: newOptions }),
                callback: () => {
                    // Данные сохранены в CloudStorage
                }
            });

            // Отправляем данные в Telegram для возможного восстановления
            callTelegramMethod('web_app_data_send', {
                type: 'phoneSelection',
                data: newOptions,
                timestamp: Date.now(),
                step: 'phone_selection'
            });

            // Показываем тактильную обратную связь
            callTelegramMethod('web_app_trigger_haptic_feedback', {
                type: 'impact',
                impact_style: 'light'
            });
        }

        // MainButton больше не используется, так как есть желтая кнопка
    };

    // Функция для проверки, все ли выбрано (без проверки selectedDevice)
    const isAllOptionsSelected = useCallback(() => {
        const allSelected = selectedOptions.model !== '' &&
            selectedOptions.variant !== null && selectedOptions.variant !== undefined &&
            selectedOptions.storage !== '' &&
            selectedOptions.color !== '';

        console.log('🔍 isAllOptionsSelected - selectedOptions:', selectedOptions);
        console.log('🔍 isAllOptionsSelected - allSelected:', allSelected);
        
        return allSelected;
    }, [selectedOptions]);

    // Загружаем устройство и цену когда все выбрано
    useEffect(() => {
        const allSelected = isAllOptionsSelected();

        console.log('🔍 LoadDevice useEffect - allSelected:', allSelected);
        console.log('🔍 LoadDevice useEffect - selectedOptions:', selectedOptions);

        if (allSelected) {
            console.log('🔍 LoadDevice useEffect - Loading device...');
            devices.loadDevice({
                model: selectedOptions.model,
                variant: selectedOptions.variant || '',
                storage: selectedOptions.storage,
                color: selectedOptions.color
            });
        }
    }, [selectedOptions, devices.loadDevice, isAllOptionsSelected]);

    // Функция для сохранения модели в БД
    const saveModelToDB = async (modelName: string) => {
        if (telegramId) {
            try {
                const response = await fetch('/api/request/model', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        modelname: modelName,
                    }),
                });

                if (response.ok) {
                } else {
                    console.error('Ошибка сохранения модели в БД');
                }
            } catch (error) {
                console.error('Ошибка при сохранении модели:', error);
            }
        }
    };

    useEffect(() => {
        console.log('🔍 SelectedDevice useEffect - devices.selectedDevice:', devices.selectedDevice);
        
        if (devices.selectedDevice) {
            console.log('🔍 SelectedDevice useEffect - Processing selected device...');
            const device = devices.selectedDevice;
            const fullName = `Apple iPhone ${device.model}${device.variant ? ` ${getVariantLabel(device.variant)}` : ''} ${device.storage} ${getColorLabel(device.color)}`;

            setModel(fullName);
            setPrice(device.basePrice);

            // Сохраняем basePrice в sessionStorage для condition страницы
            sessionStorage.setItem('basePrice', device.basePrice.toString());

            // Сохраняем модель в БД
            saveModelToDB(fullName);

            // Диалог будет показан автоматически в другом useEffect
        }
    }, [devices.selectedDevice, setModel, setPrice, telegramId]);

    // Создаем заявку при загрузке страницы
    useEffect(() => {
        const createRequest = async () => {
            if (telegramId) {
                try {
                    // Получаем базовую цену из найденной модели
                    let basePrice = 0; // цена по умолчанию
                    if (devices.selectedDevice) {
                        basePrice = devices.selectedDevice.basePrice;
                        } else {
                        }

                    // На form page всегда сохраняем базовую цену (без поломок)
                    // Это будет перезаписано на condition page с учетом поломок
                    await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                            price: basePrice, // Базовая цена без поломок
                            modelname: modelname, // Название модели
                            currentStep: 'form',
                        }),
                    });
                } catch (error) {
                    console.error('Error creating request:', error);
                }
            }
        };

        createRequest();
    }, [telegramId, username, devices.selectedDevice, modelname]);

    // Загружаем прогресс из sessionStorage или CloudStorage при загрузке страницы
    useEffect(() => {
        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('phoneSelection');

            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    // Обрабатываем случай, когда variant был пустой строкой
                    if (parsed.variant === '') {
                        parsed.variant = null;
                    }
                    setSelectedOptions(parsed);
                    // Обновляем текущий выбор
                    updateCurrentSelection(parsed);
                    // Проверяем, есть ли уже выбранные элементы (режим редактирования)
                    const hasSelectedItems = parsed.model || parsed.variant || parsed.storage || parsed.color;
                    if (hasSelectedItems) {
                        setIsEditing(true);
                        // Проверяем, все ли выбрано
                        const allSelected = checkIfAllSelected(parsed);
                        setIsAllSelected(!!allSelected);
                    }
                    return; // Не загружаем из CloudStorage, если есть в sessionStorage
                } catch (e) {
                    sessionStorage.removeItem('phoneSelection'); // Очищаем поврежденные данные
                }
            }
        }

        // Если нет данных в sessionStorage, пробуем загрузить из CloudStorage
        callTelegramMethod('web_app_cloud_storage_get', {
            key: 'phoneSelection',
            callback: (value: string | null) => {
                if (value) {
                    try {
                        const parsed = JSON.parse(value);
                        if (parsed.data) {
                            // Обрабатываем случай, когда variant был пустой строкой
                            if (parsed.data.variant === '') {
                                parsed.data.variant = null;
                            }
                            setSelectedOptions(parsed.data);
                            // Обновляем текущий выбор
                            updateCurrentSelection(parsed.data);
                            // Проверяем, есть ли уже выбранные элементы (режим редактирования)
                            const hasSelectedItems = parsed.data.model || parsed.data.variant || parsed.data.storage || parsed.data.color;
                            if (hasSelectedItems) {
                                setIsEditing(true);
                            }

                            // Сохраняем в sessionStorage для быстрого доступа
                            if (typeof window !== 'undefined') {
                                sessionStorage.setItem('phoneSelection', JSON.stringify(parsed.data));
                            }
                        }
                    } catch (e) {
                        console.error('❌ Ошибка при парсинге данных из CloudStorage:', e);
                    }
                }
            },
        });
    }, [updateCurrentSelection, checkIfAllSelected]);

    // Инициализация Telegram WebApp при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Уведомляем Telegram о готовности приложения
            callTelegramMethod('web_app_ready', {});

            // Расширяем приложение на весь экран
            callTelegramMethod('web_app_expand', {});

            // Запрашиваем информацию о viewport
            callTelegramMethod('web_app_request_viewport', {});

            // MainButton больше не используется, так как есть желтая кнопка
        }
    }, []);

    // Автоматически открываем диалог когда все поля заполнены
    useEffect(() => {
        const allSelected = isAllOptionsSelected();
        
        console.log('🔍 Dialog useEffect - allSelected:', allSelected);
        console.log('🔍 Dialog useEffect - selectedOptions:', selectedOptions);
        console.log('🔍 Dialog useEffect - devices.selectedDevice:', devices.selectedDevice);

        if (allSelected && devices.selectedDevice) {
            console.log('🔍 Dialog useEffect - Showing dialog!');
            // Небольшая задержка для лучшего UX
            setTimeout(() => {
                setShowSummaryDialog(true);
            }, 300);
        }
    }, [isAllOptionsSelected, devices.selectedDevice]);

    // Скрываем диалог если не все поля заполнены
    // Убираем этот useEffect, так как он конфликтует с логикой показа диалога
    // useEffect(() => {
    //     if (!isAllOptionsSelected()) {
    //         setShowSummaryDialog(false);
    //     }
    // }, [isAllOptionsSelected]);

    // Убираем принудительное скрытие диалога - пусть логика выше управляет показом


    // Универсальная функция для вызова методов Telegram WebApp
    const callTelegramMethod = (methodName: string, data?: any) => {
        try {
            if (typeof window !== 'undefined') {
                // Используем официальный API Telegram WebApp
                if ((window as any).Telegram?.WebApp) {
                    const webApp = (window as any).Telegram.WebApp;

                    switch (methodName) {
                        case 'web_app_ready':
                            webApp.ready();
                            break;
                        case 'web_app_expand':
                            webApp.expand();
                            break;
                        case 'web_app_data_send':
                            webApp.sendData(JSON.stringify(data));
                            break;
                        case 'web_app_trigger_haptic_feedback':
                            if (webApp.HapticFeedback) {
                                webApp.HapticFeedback.impactOccurred(data.impact_style || 'light');
                            }
                            break;
                        case 'web_app_cloud_storage_set':
                            if (webApp.CloudStorage) {
                                webApp.CloudStorage.setItem(data.key, data.value, (error: any) => {
                                    if (error) {
                                        // Ошибка сохранения в CloudStorage
                                    } else {
                                        // Данные сохранены в CloudStorage
                                    }
                                });
                            }
                            break;
                        case 'web_app_cloud_storage_get':
                            if (webApp.CloudStorage) {
                                webApp.CloudStorage.getItem(data.key, (error: any, value: any) => {
                                    if (error) {
                                        // Ошибка чтения CloudStorage
                                    } else {
                                        data.callback && data.callback(value);
                                    }
                                });
                            }
                            break;
                        default:
                        // Неизвестный метод
                    }
                    return;
                }

                // Fallback для Desktop и Mobile
                if ((window as any).TelegramWebviewProxy?.postEvent) {
                    (window as any).TelegramWebviewProxy.postEvent(methodName, JSON.stringify(data));
                    return;
                }

                // Fallback для Web версии
                if (window.parent && window.parent !== window) {
                    const message = {
                        eventType: methodName,
                        eventData: data
                    };
                    window.parent.postMessage(JSON.stringify(message), 'https://web.telegram.org');
                    return;
                }

                // Для обычного браузера (fallback) - просто логируем
            }
        } catch (e) {
            // Ошибка при вызове метода - логируем для отладки
        }
    };

    // Компонент готов к использованию

    const getColorLabel = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'G': 'Золотой',
            'R': 'Красный',
            'Bl': 'Синий',
            'Wh': 'Белый',
            'C': 'Черный'
        };
        return colorMap[color] || color;
    };

    // Функция для форматирования вариантов с заглавной буквы
    const getVariantLabel = (variant: string) => {
        if (!variant) return '';

        const variantMap: { [key: string]: string } = {
            'R': 'R',
            'S': 'S',
            'S Max': 'S Max',
            'Pro': 'Pro',
            'Pro Max': 'Pro Max',
            'mini': 'Mini',
            'Plus': 'Plus',
            'se': 'SE'
        };

        return variantMap[variant] || variant;
    };


    const getColorStyle = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'G': '#F5D76E', // Золотой iPhone (более реалистичный)
            'R': '#E74C3C', // Красный iPhone (Product Red)
            'Bl': '#3498DB', // Синий iPhone (Pacific Blue)
            'Wh': '#F8F9FA', // Белый iPhone (с легким оттенком)
            'C': '#2C3E50'  // Черный iPhone (Space Gray)
        };
        return colorMap[color] || '#808080';
    };

    const handleContinueToNext = async () => {
        if (devices.selectedDevice) {
            // Обновляем currentStep в БД перед переходом
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
                            currentStep: 'condition',
                        }),
                    });
                } catch (error) {
                    console.error('Ошибка обновления currentStep:', error);
                }
            }

            // Переходим на страницу выбора состояния
            router.push('/request/condition');
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-12 overflow-hidden">
                    {/* Прогресс-бар */}
                    <div className="pb-1">
                        <ProgressBar
                            currentStep={getCurrentStep()}
                            totalSteps={5}
                            steps={steps}
                        />
                    </div>

                    <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto flex flex-col gap-1 pb-4">



                            {/* Секция выбора модели */}
                            {true && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm"
                                >
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Модель</h3>
                                    {devices.models.length > 0 && (
                                        <div className="grid grid-cols-4 gap-1">
                                            {devices.models.map((model: string) => (
                                                <motion.div
                                                    key={model}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <Button
                                                        onClick={() => handleOptionSelect('model', model)}
                                                        className={`w-full h-7 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.model === model
                                                                ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        {selectedOptions.model === model && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                                <span className="text-white text-xs font-bold">✓</span>
                                                            </div>
                                                        )}
                                                        {model}
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Секция выбора варианта */}
                            {selectedOptions.model && devices.variants.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="p-2 rounded-xl shadow-sm bg-white"
                                >
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Вариант</h3>
                                    <div className="grid grid-cols-3 gap-1">
                                        {devices.variants.map((variant: string) => (
                                            <Button
                                                key={variant}
                                                onClick={() => handleOptionSelect('variant', variant)}
                                                className={`w-full h-7 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.variant === variant
                                                        ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                {selectedOptions.variant === variant && (
                                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                                {variant === '' ? '' : getVariantLabel(variant)}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Секция выбора объема памяти */}
                            {selectedOptions.model && devices.storages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="p-2 rounded-xl shadow-sm bg-white"
                                >
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Объем памяти</h3>
                                    <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
                                        {devices.storages.slice(0, 3).map((storage: string) => (
                                            <Button
                                                key={storage}
                                                onClick={() => handleOptionSelect('storage', storage)}
                                                className={`h-8 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.storage === storage
                                                        ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                {selectedOptions.storage === storage && (
                                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                                {storage}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 max-w-xs mx-auto mt-1">
                                        {devices.storages.slice(3).map((storage: string) => (
                                            <Button
                                                key={storage}
                                                onClick={() => handleOptionSelect('storage', storage)}
                                                className={`h-8 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.storage === storage
                                                        ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                {selectedOptions.storage === storage && (
                                                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                                {storage}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Секция выбора цвета */}
                            {selectedOptions.model && devices.colors.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="p-2 rounded-xl shadow-sm bg-white"
                                >
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Цвет</h3>
                                    <div className="flex flex-row justify-around gap-2">
                                        {devices.colors.map((color: string) => (
                                            <Button
                                                key={color}
                                                onClick={() => handleOptionSelect('color', color)}
                                                className={`h-8 w-8 rounded-full border-2 transition-all duration-200 relative group flex items-center justify-between p-0 ${selectedOptions.color === color
                                                        ? 'border-[#2dc2c6] ring-2 ring-[#2dc2c6]/30 shadow-lg'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                style={{
                                                    backgroundColor: getColorStyle(color),
                                                    opacity: !devices.colors.includes(color) ? 0.3 : 1
                                                }}
                                                title={getColorLabel(color)}
                                            >
                                                {selectedOptions.color === color && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                    {getColorLabel(color)}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Диалоговое окно с итоговой информацией */}
                            <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                                <DialogContent
                                    className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                                    onClick={handleContinueToNext}
                                    showCloseButton={false}
                                >
                                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                                        📱 Ваша полная конфигурация
                                    </DialogTitle>
                                    {devices.selectedDevice && (
                                        <>
                                            <div className="text-center space-y-4">
                                                {/* Полная модель */}
                                                <div className="bg-[#2dc2c6]/10 p-4 rounded-xl border border-[#2dc2c6]">
                                                    <p className="text-lg font-semibold text-gray-900 break-words leading-tight">
                                                        iPhone {devices.selectedDevice.model}
                                                        {devices.selectedDevice.variant ? ` ${getVariantLabel(devices.selectedDevice.variant)}` : ''}
                                                        {devices.selectedDevice.storage ? ` ${devices.selectedDevice.storage}` : ''}
                                                        {devices.selectedDevice.color ? ` ${getColorLabel(devices.selectedDevice.color)}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-center text-sm text-gray-600 mt-4">
                                                👆 Нажмите на окно для перехода к следующему шагу
                                            </p>
                                            <p className="text-center text-sm text-gray-600 mt-1">
                                                ✏️ Нажмите вне поля, если хотите отредактировать свой выбор
                                            </p>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>


                        </div>
                    </div>
                </div>
            </Page>
        </LazyMotion>
    );
}
