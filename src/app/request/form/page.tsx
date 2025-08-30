'use client'

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { iphones, IPhone } from '@/core/appleModels';
import { Button } from '@/components/ui/button';

export default function FormPage() {
    const { modelname, setModel, telegramId, username } = useStartForm();
    const router = useRouter();

    // Сбрасываем все состояния при загрузке страницы (только если это новая заявка)
    useEffect(() => {
        // Проверяем, есть ли сохраненные данные в sessionStorage
        const savedData = sessionStorage.getItem('phoneSelection');
        if (!savedData) {
            // Только если нет сохраненных данных - сбрасываем состояния
            console.log('Новая заявка - сбрасываем состояния');
            // Сбрасываем только основные состояния, не вызывая resetAllStates
            setModel('Apple iPhone 11');
            // Очищаем sessionStorage для новой заявки
            sessionStorage.removeItem('phoneSelection');
        } else {
            console.log('Продолжение заявки - оставляем состояния');
        }
    }, []); // Убираем resetAllStates из зависимостей

    // Инициализируем состояние
    const [selectedOptions, setSelectedOptions] = useState({
        model: '',
        variant: null, // Изменяем на null чтобы не было предвыбора
        storage: '',
        color: '',
        country: '',
        simType: ''
    });

    // Состояние для диалогового окна
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);

    // Функции для умной фильтрации
    const getAvailableVariants = (): string[] => {
        if (!selectedOptions.model) {
            // Если модель не выбрана, показываем все варианты, включая пустые
            const allVariants = iphones.map((phone: IPhone) => phone.variant);
            return [...new Set(allVariants)].sort();
        }
        const filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        const variants = [...new Set(filteredPhones.map((phone: IPhone) => phone.variant))];
        return variants.sort(); // Убираем фильтр пустых вариантов
    };

    const getAvailableStorages = (): string[] => {
        if (!selectedOptions.variant) {
            // Если вариант не выбран, показываем все объемы памяти для выбранной модели
            return [...new Set(iphones.map((phone: IPhone) => phone.storage))].sort((a: string, b: string) => {
                const aNum = parseInt(a.replace(/[^\d]/g, ''));
                const bNum = parseInt(b.replace(/[^\d]/g, ''));
                if (a.includes('TB') && !b.includes('TB')) return 1;
                if (!a.includes('TB') && b.includes('TB')) return -1;
                return aNum - bNum;
            });
        }
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        return [...new Set(filteredPhones.map((phone: IPhone) => phone.storage))].sort((a: string, b: string) => {
            const aNum = parseInt(a.replace(/[^\d]/g, ''));
            const bNum = parseInt(b.replace(/[^\d]/g, ''));
            if (a.includes('TB') && !b.includes('TB')) return 1;
            if (!a.includes('TB') && b.includes('TB')) return -1;
            return aNum - bNum;
        });
    };

    const getAvailableColors = (): string[] => {
        // Фиксированный список из 5 основных цветов iPhone
        const validColors = ['G', 'R', 'Bl', 'Wh', 'C'];
        
        if (!selectedOptions.storage) {
            // Если объем памяти не выбран, показываем все 5 цветов
            return validColors;
        }
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.storage === selectedOptions.storage);
        }
        
        // Если после фильтрации нет телефонов, показываем все цвета для выбранной модели
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        // Фильтруем только валидные цвета
        const availableColors = [...new Set(filteredPhones.map((phone: IPhone) => phone.color))];
        return availableColors.filter(color => validColors.includes(color));
    };

    const getAvailableCountries = (): string[] => {
        // Фиксированный список из 4 стран
        const validCountries = [
            'Китай 🇨🇳',
            'США 🇺🇸', 
            'Европа 🇪🇺',
            'ОАЭ 🇦🇪'
        ];
        
        if (!selectedOptions.simType) {
            // Если тип SIM не выбран, показываем все 4 страны
            return validCountries;
        }
        
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.storage === selectedOptions.storage);
        }
        if (selectedOptions.color) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.color === selectedOptions.color);
        }
        if (selectedOptions.simType) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.simType === selectedOptions.simType);
        }
        
        // Если после фильтрации нет телефонов, показываем все страны для выбранной модели
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        // Фильтруем только валидные страны
        const availableCountries = [...new Set(filteredPhones.map((phone: IPhone) => phone.country))];
        return availableCountries.filter(country => validCountries.includes(country));
    };

    const getAvailableSimTypes = (): string[] => {
        if (!selectedOptions.color) {
            // Если цвет не выбран, показываем все типы SIM
            return [...new Set(iphones.map((phone: IPhone) => phone.simType))].sort();
        }
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.storage === selectedOptions.storage);
        }
        if (selectedOptions.color) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.color === selectedOptions.color);
        }
        
        // Если после фильтрации нет телефонов, показываем все SIM типы для выбранной модели
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        return [...new Set(filteredPhones.map((phone: IPhone) => phone.simType))];
    };

    const handleOptionSelect = (type: keyof typeof selectedOptions, value: string) => {
        console.log('Выбор опции:', { type, value, currentOptions: selectedOptions });
        
        const newOptions = {
            ...selectedOptions,
            [type]: selectedOptions[type] === value ? '' : value
        };

        console.log('Новые опции:', newOptions);

        // Сбрасываем зависимые параметры
        if (type === 'model') {
            newOptions.variant = null;
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'variant') {
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'storage') {
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'color') {
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'simType') {
            newOptions.country = '';
        }

        console.log('Опции после сброса зависимых:', newOptions);
        setSelectedOptions(newOptions);

        // Сохраняем в sessionStorage для быстрого восстановления
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('phoneSelection', JSON.stringify(newOptions));
        }

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

        // MainButton больше не используется, так как есть желтая кнопка
    };

    // Находим подходящий iPhone
    const findMatchingPhone = (): IPhone | null => {
        if (!selectedOptions.model || !selectedOptions.storage || !selectedOptions.color || !selectedOptions.simType || !selectedOptions.country) {
            console.log('Не все опции выбраны:', {
                model: selectedOptions.model,
                storage: selectedOptions.storage,
                color: selectedOptions.color,
                simType: selectedOptions.simType,
                country: selectedOptions.country
            });
            return null;
        }

        // Ищем телефон с учетом того, что variant может быть пустым
        const foundPhone = iphones.find((phone: IPhone) =>
            phone.model === selectedOptions.model &&
            (selectedOptions.variant ? phone.variant === selectedOptions.variant : phone.variant === '') &&
            phone.storage === selectedOptions.storage &&
            phone.color === selectedOptions.color &&
            phone.simType === selectedOptions.simType &&
            phone.country === selectedOptions.country
        );

        console.log('Поиск телефона:', {
            selectedOptions,
            foundPhone,
            totalPhones: iphones.length
        });

        return foundPhone || null;
    };

    const matchingPhone = findMatchingPhone();

    // Логика проверки: все поля должны быть выбраны в правильном порядке
    const isAllOptionsSelected = selectedOptions.model !== '' &&
        selectedOptions.storage !== '' &&
        selectedOptions.color !== '' &&
        selectedOptions.simType !== '' &&
        selectedOptions.country !== '' &&
        matchingPhone;

    useEffect(() => {
        if (matchingPhone) {
            const fullName = `Apple iPhone ${matchingPhone.model}${matchingPhone.variant ? ` ${matchingPhone.variant}` : ''} ${matchingPhone.storage} ${getColorLabel(matchingPhone.color)} ${matchingPhone.country.split(' ')[0]} ${matchingPhone.simType}`;

            setModel(fullName);
        }
    }, [matchingPhone, setModel]);

    // Создаем заявку при загрузке страницы
    useEffect(() => {
        const createRequest = async () => {
            if (telegramId) {
                try {
                    // Вычисляем базовую цену на основе выбранной модели
                    let basePrice = 48000; // цена по умолчанию
                    if (selectedOptions.model) {
                        const modelNum = parseInt(selectedOptions.model);
                        if (!isNaN(modelNum)) {
                            // Базовая цена увеличивается с каждой моделью
                            basePrice = 48000 + (modelNum - 11) * 8000;
                        }
                    }
                    
                    await fetch('/api/request/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            username: username || 'Unknown',
                            price: basePrice,
                        }),
                    });
                } catch (error) {
                    console.error('Error creating request:', error);
                }
            }
        };

        createRequest();
    }, [telegramId, username, selectedOptions.model]);

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
    }, []);

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
        if (isAllOptionsSelected && matchingPhone) {
            // Небольшая задержка для лучшего UX
            setTimeout(() => {
                setShowSummaryDialog(true);
            }, 300);
        }
    }, [isAllOptionsSelected, matchingPhone]);

    // Скрываем диалог если не все поля заполнены
    useEffect(() => {
        if (!isAllOptionsSelected) {
            setShowSummaryDialog(false);
        }
    }, [isAllOptionsSelected]);

    // Отслеживаем изменение пути и скрываем диалог при возврате с display_scratches
    useEffect(() => {
        // Упрощенная логика - просто скрываем диалог при загрузке страницы
        setShowSummaryDialog(false);
    }, []);


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

                // Для обычного браузера (fallback)
                // Метод недоступен в браузере
            }
        } catch (e) {
            // Ошибка при вызове метода
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

    const handleContinueToNext = () => {
        if (matchingPhone) {
            // Модель уже сохранена в контексте через useEffect
            // Переходим на страницу выбора состояния
            router.push('/request/condition');
        }
    };

    return (
        <Page back={true}>
            <div className="w-full h-full flex flex-col gap-2 p-2 bg-gray-50">

                {/* Секция выбора модели */}
                <div className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm">
                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-sm">Модель</h3>
                    <div className="grid grid-cols-4 gap-1">
                        {[...new Set(iphones.map((phone: IPhone) => phone.model))].sort((a: string, b: string) => {
                            // Сначала X, затем числовые модели, затем остальные буквенные
                            if (a === 'X') return -1;
                            if (b === 'X') return 1;
                            
                            const aNum = parseInt(a);
                            const bNum = parseInt(b);
                            if (!isNaN(aNum) && !isNaN(bNum)) {
                                return aNum - bNum;
                            }
                            if (isNaN(aNum) && isNaN(bNum)) {
                                return a.localeCompare(b);
                            }
                            return isNaN(aNum) ? 1 : -1;
                        }).map((model: string) => (
                            <Button
                                key={model}
                                onClick={() => handleOptionSelect('model', model)}
                                className={`w-full h-8 rounded-lg border transition-all duration-200 text-xs font-medium flex items-center justify-center truncate ${selectedOptions.model === model
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                {model}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора варианта */}
                <div className={`p-2 border border-gray-200 rounded-xl shadow-sm ${!selectedOptions.model ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-sm">Вариант</h3>
                    <div className="grid grid-cols-3 gap-1">
                        {getAvailableVariants().map((variant: string) => (
                            <Button
                                key={variant}
                                onClick={() => handleOptionSelect('variant', variant)}
                                disabled={!selectedOptions.model}
                                className={`w-full h-8 rounded-lg border transition-all duration-200 text-xs font-medium flex items-center justify-center truncate ${selectedOptions.variant === variant
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                {variant}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора объема памяти */}
                <div className={`p-3 border border-gray-200 rounded-xl shadow-sm ${!selectedOptions.variant ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <h3 className="text-center font-semibold text-gray-900 mb-2 text-base">Объем памяти</h3>
                    <div className="flex flex-row justify-between gap-1">
                        {getAvailableStorages().map((storage: string) => (
                            <Button
                                key={storage}
                                onClick={() => handleOptionSelect('storage', storage)}
                                disabled={!selectedOptions.variant}
                                className={`flex-1 h-10 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate ${selectedOptions.storage === storage
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                {storage}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора цвета */}
                <div className={`p-3 border border-gray-200 rounded-xl shadow-sm ${!selectedOptions.storage ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <h3 className="text-center font-semibold text-gray-900 mb-2 text-base">Цвет</h3>
                    <div className="flex flex-row justify-around gap-2">
                        {getAvailableColors().map((color: string) => (
                            <Button
                                key={color}
                                onClick={() => handleOptionSelect('color', color)}
                                disabled={!selectedOptions.storage}
                                className={`h-10 w-10 rounded-full border-2 transition-all duration-200 relative group flex items-center justify-between p-0 ${selectedOptions.color === color
                                    ? 'border-[#2dc2c6] ring-2 ring-[#2dc2c6]/30 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{
                                    backgroundColor: getColorStyle(color),
                                    opacity: !getAvailableColors().includes(color) ? 0.3 : 1
                                }}
                                title={getColorLabel(color)}
                            >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {getColorLabel(color)}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора типа SIM */}
                <div className={`p-3 border border-gray-200 rounded-xl shadow-sm ${!selectedOptions.color ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <h3 className="text-center font-semibold text-gray-900 mb-2 text-base">Тип SIM</h3>
                    <div className="grid grid-cols-2 gap-1">
                        {getAvailableSimTypes().map((simType: string) => (
                            <Button
                                key={simType}
                                onClick={() => handleOptionSelect('simType', simType)}
                                disabled={!selectedOptions.color}
                                className={`w-full h-8 rounded-lg border transition-all duration-200 text-xs font-medium flex items-center justify-center ${selectedOptions.simType === simType
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
                                    }`}
                            >
                                {simType}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора страны производителя */}
                <div className={`p-3 border border-gray-200 rounded-xl shadow-sm ${!selectedOptions.simType ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <h3 className="text-center font-semibold text-gray-900 mb-2 text-base">Страна производитель</h3>
                    <div className="grid grid-cols-2 gap-1">
                        {getAvailableCountries().map((country: string) => (
                            <Button
                                key={country}
                                onClick={() => handleOptionSelect('country', country)}
                                disabled={!selectedOptions.simType}
                                className={`w-full h-10 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center ${selectedOptions.country === country
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center justify-center">
                                    <span className="text-lg">{country.split(' ')[1]}</span>
                                </div>
                            </Button>
                        ))}
                    </div>

                </div>

                {/* Диалоговое окно с итоговой информацией */}
                <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                    <DialogContent
                        className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                        onClick={handleContinueToNext}
                        showCloseButton={false}
                    >
                        <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                            📱 Ваша конфигурация
                        </DialogTitle>
                        {matchingPhone && (
                            <>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200 break-words">
                                        iPhone {matchingPhone.model}
                                        {matchingPhone.variant ? ` ${matchingPhone.variant}` : ''},
                                        {matchingPhone.storage},
                                        {getColorLabel(matchingPhone.color)},
                                        {matchingPhone.country.split(' ')[0]},
                                        {matchingPhone.simType}
                                    </p>
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-3">
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
        </Page>
    );
}



