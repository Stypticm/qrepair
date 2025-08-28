'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { iphones, IPhone } from '@/core/appleModels';

export default function FormPage() {
    const { modelname, setModel } = useStartForm();
    const router = useRouter();
    
    // Инициализируем состояние
    const [selectedOptions, setSelectedOptions] = useState({
        model: '',
        variant: '',
        storage: '',
        color: '',
        country: ''
    });

    // Состояние для диалогового окна
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    
    // Функции для умной фильтрации
    const getAvailableVariants = () => {
        if (!selectedOptions.model) return [];
        const filteredPhones = iphones.filter(phone => phone.model === selectedOptions.model);
        const variants = [...new Set(filteredPhones.map(phone => phone.variant))];
        return ['', ...variants.filter(v => v !== '')].sort();
    };

    const getAvailableStorages = () => {
        if (!selectedOptions.model) return [];
        let filteredPhones = iphones.filter(phone => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter(phone => phone.variant === selectedOptions.variant);
        }
        return [...new Set(filteredPhones.map(phone => phone.storage))];
    };

    const getAvailableColors = () => {
        if (!selectedOptions.model) return [];
        let filteredPhones = iphones.filter(phone => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter(phone => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter(phone => phone.storage === selectedOptions.storage);
        }
        return [...new Set(filteredPhones.map(phone => phone.color))];
    };

    const getAvailableCountries = () => {
        if (!selectedOptions.model) return [];
        let filteredPhones = iphones.filter(phone => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter(phone => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter(phone => phone.storage === selectedOptions.storage);
        }
        if (selectedOptions.color) {
            filteredPhones = filteredPhones.filter(phone => phone.color === selectedOptions.color);
        }
        return [...new Set(filteredPhones.map(phone => phone.country))];
    };

    const handleOptionSelect = (type: keyof typeof selectedOptions, value: string) => {
        const newOptions = {
            ...selectedOptions,
            [type]: selectedOptions[type] === value ? '' : value
        };
        
        // Сбрасываем зависимые параметры
        if (type === 'model') {
            newOptions.variant = '';
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
        } else if (type === 'variant') {
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
        } else if (type === 'storage') {
            newOptions.color = '';
            newOptions.country = '';
        } else if (type === 'color') {
            newOptions.country = '';
        }
        
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
                console.log('☁️ Сохранено в CloudStorage:', newOptions);
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
        console.log('🔍 Проверяем выбор опций:', {
            selectedOptions: newOptions,
            allOptionsSelected: isAllOptionsSelected,
            optionsCount: Object.values(newOptions).filter(option => option !== '').length
        });
    };

    // Находим подходящий iPhone
    const findMatchingPhone = (): IPhone | null => {
        if (!selectedOptions.model || !selectedOptions.storage || !selectedOptions.color || !selectedOptions.country) {
            return null;
        }

        return iphones.find(phone => 
            phone.model === selectedOptions.model &&
            (selectedOptions.variant ? phone.variant === selectedOptions.variant : phone.variant === '') &&
            phone.storage === selectedOptions.storage &&
            phone.color === selectedOptions.color &&
            phone.country === selectedOptions.country
        ) || null;
    };

    const matchingPhone = findMatchingPhone();
    const isAllOptionsSelected = Object.values(selectedOptions).every(value => value !== '') && matchingPhone;

    useEffect(() => {
        if (matchingPhone) {
            const fullName = `Apple iPhone ${matchingPhone.model}${matchingPhone.variant ? ` ${matchingPhone.variant}` : ''}`;
            setModel(fullName);
        }
    }, [matchingPhone, setModel]);

    // Загружаем прогресс из БД при загрузке страницы
    useEffect(() => {
        const loadProgressFromDB = async () => {
            try {
                const response = await fetch('/api/request/getProgress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ modelname }),
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const { model, variant, storage, color, country } = data.data;
                        
                        setSelectedOptions({
                            model: model || '',
                            variant: variant || '',
                            storage: storage || '',
                            color: color || '',
                            country: country || ''
                        });
                    }
                }
            } catch (error) {
                console.error('❌ Ошибка при загрузке прогресса:', error);
            }
        };

        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('phoneSelection');
            
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession);
                    setSelectedOptions(parsed);
                    return; // Не загружаем из БД, если есть в sessionStorage
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
                            setSelectedOptions(parsed.data);
                            
                            // Сохраняем в sessionStorage для быстрого доступа
                            if (typeof window !== 'undefined') {
                                sessionStorage.setItem('phoneSelection', JSON.stringify(parsed.data));
                            }
                            
                            return; // Не загружаем из БД, если есть в CloudStorage
                        }
                    } catch (e) {
                        // Игнорируем ошибки парсинга
                    }
                }
                
                // Если CloudStorage пуст, загружаем из БД
                if (modelname) {
                    loadProgressFromDB();
                }
            }
        });
    }, [modelname]);

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
            
            console.log('🚀 Telegram WebApp инициализирован');
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

    // MainButton больше не используется, так как есть желтая кнопка
        

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
                            console.log('📤 WebApp готов');
                            break;
                        case 'web_app_expand':
                            webApp.expand();
                            console.log('📤 WebApp расширен');
                            break;
                        case 'web_app_data_send':
                            webApp.sendData(JSON.stringify(data));
                            console.log('📤 Данные отправлены в Telegram');
                            break;
                        case 'web_app_trigger_haptic_feedback':
                            if (webApp.HapticFeedback) {
                                webApp.HapticFeedback.impactOccurred(data.impact_style || 'light');
                                console.log('📤 Haptic feedback запущен');
                            }
                            break;
                        case 'web_app_cloud_storage_set':
                            if (webApp.CloudStorage) {
                                webApp.CloudStorage.setItem(data.key, data.value, (error: any) => {
                                    if (error) {
                                        console.log('❌ Ошибка сохранения в CloudStorage:', error);
                                    } else {
                                        console.log('📤 Данные сохранены в CloudStorage');
                                    }
                                });
                            }
                            break;
                        case 'web_app_cloud_storage_get':
                            if (webApp.CloudStorage) {
                                webApp.CloudStorage.getItem(data.key, (error: any, value: any) => {
                                    if (error) {
                                        console.log('❌ Ошибка чтения CloudStorage:', error);
                                    } else {
                                        console.log('📤 Данные получены из CloudStorage:', value);
                                        data.callback && data.callback(value);
                                    }
                                });
                            }
                            break;
                        default:
                            console.log(`🌐 Неизвестный метод ${methodName}`);
                    }
                    return;
                }
                
                // Fallback для Desktop и Mobile
                if ((window as any).TelegramWebviewProxy?.postEvent) {
                    (window as any).TelegramWebviewProxy.postEvent(methodName, JSON.stringify(data));
                    console.log(`📤 Метод ${methodName} вызван через TelegramWebviewProxy`);
                    return;
                }
                
                // Fallback для Web версии
                if (window.parent && window.parent !== window) {
                    const message = {
                        eventType: methodName,
                        eventData: data
                    };
                    window.parent.postMessage(JSON.stringify(message), 'https://web.telegram.org');
                    console.log(`📤 Метод ${methodName} вызван через postMessage`);
                    return;
                }
                
                // Для обычного браузера (fallback)
                console.log(`🌐 Метод ${methodName} недоступен в браузере`);
            }
        } catch (e) {
            console.log(`❌ Ошибка при вызове метода ${methodName}:`, e);
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
            'G': '#FFD700', // Золотой
            'R': '#FF3B30', // Красный
            'Bl': '#007AFF', // Синий
            'Wh': '#FFFFFF', // Белый
            'C': '#000000'  // Черный
        };
        return colorMap[color] || '#808080';
    };

    const handleContinueToNext = () => {
        if (matchingPhone) {
            // Сохраняем выбранную конфигурацию в контекст
            setModel(matchingPhone.model);
            
            // Переходим на следующую страницу
            router.push('/request/display_scratches');
        }
    };

    return (
        <Page back={true}>
            <div className="w-full max-w-4xl mx-auto">
                {/* <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                        💡 <strong>Совет:</strong> Если нужные варианты заблокированы, попробуйте выбрать другую модель или вариант
                    </p>
                </div> */}
                
                {/* Секция выбора модели */}
                <div className="mb-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Модель</h3>
                    <div className="grid grid-cols-6 gap-1">
                        {[...new Set(iphones.map(phone => phone.model))].sort((a, b) => parseInt(a) - parseInt(b)).map((model) => (
                            <button
                                key={model}
                                onClick={() => handleOptionSelect('model', model)}
                                className={`px-1 py-1 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                                    selectedOptions.model === model
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {model}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора варианта */}
                <div className="mb-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Вариант</h3>
                    <div className="grid grid-cols-4 gap-1">
                        {getAvailableVariants().map((variant) => (
                            <button
                                key={variant}
                                onClick={() => handleOptionSelect('variant', variant)}
                                disabled={!getAvailableVariants().includes(variant)}
                                className={`px-1 py-1 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                                    selectedOptions.variant === variant
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {variant || ''}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора объема памяти */}
                <div className="mb-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Объем памяти</h3>
                    <div className="grid grid-cols-4 gap-1">
                        {getAvailableStorages().map((storage) => (
                            <button
                                key={storage}
                                onClick={() => handleOptionSelect('storage', storage)}
                                disabled={!getAvailableStorages().includes(storage)}
                                className={`px-1 py-1 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                                    selectedOptions.storage === storage
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {storage}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора цвета */}
                <div className="mb-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Цвет</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {getAvailableColors().map((color) => (
                            <button
                                key={color}
                                onClick={() => handleOptionSelect('color', color)}
                                disabled={!getAvailableColors().includes(color)}
                                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 relative group ${
                                    selectedOptions.color === color
                                        ? 'border-green-500 ring-2 ring-green-300'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{
                                    backgroundColor: getColorStyle(color),
                                    opacity: !getAvailableColors().includes(color) ? 0.3 : 1
                                }}
                                title={getColorLabel(color)}
                            >
                                {/* Подсказка при наведении */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {getColorLabel(color)}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Секция выбора страны производителя */}
                <div className="mb-2 p-3 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Страна производитель</h3>
                    <div className="grid grid-cols-3 gap-1">
                        {getAvailableCountries().map((country) => (
                            <button
                                key={country}
                                onClick={() => handleOptionSelect('country', country)}
                                disabled={!getAvailableCountries().includes(country)}
                                className={`px-1 py-1 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                                    selectedOptions.country === country
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-lg mb-1">{country.split(' ')[1]}</span>
                                    <span className="text-xs">{country.split(' ')[0]}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>



                {/* Диалоговое окно с итоговой информацией */}
                <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                    <DialogContent 
                        className="bg-yellow-400/95 border-yellow-500 cursor-pointer"
                        onClick={handleContinueToNext}
                        showCloseButton={false}
                    >
                        <DialogTitle className="text-center text-xl font-bold text-gray-900 mb-4">
                            📱 Ваша конфигурация
                        </DialogTitle>
                        {matchingPhone && (
                            <>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                                        iPhone {matchingPhone.model}
                                        {matchingPhone.variant ? ` ${matchingPhone.variant}` : ''},
                                        {matchingPhone.storage},
                                        {getColorLabel(matchingPhone.color)},
                                        {matchingPhone.country.split(' ')[0]}
                                    </p>
                                </div>
                                <p className="text-center text-sm text-gray-700 mt-4">
                                    👆 Нажмите на окно для перехода к следующему шагу
                                </p>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Page>
    );
}



