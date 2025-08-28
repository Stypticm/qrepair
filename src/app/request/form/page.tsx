'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
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

    // Предотвращаем дублирование API вызовов
    const [isSaving, setIsSaving] = useState(false);

    // Проверяем, все ли опции выбраны для активации кнопки "Далее"
    const isAllOptionsSelected = Object.values(selectedOptions).every(option => option !== '');

    // Получаем все возможные варианты
    const models = [...new Set(iphones.map(phone => phone.model))].sort((a, b) => parseInt(a) - parseInt(b));
    const variants = ['', ...new Set(iphones.map(phone => phone.variant).filter(v => v !== ''))].sort();
    const storages = [...new Set(iphones.map(phone => phone.storage))].sort((a, b) => {
        const aNum = parseInt(a.replace('GB', '').replace('TB', '000'));
        const bNum = parseInt(b.replace('GB', '').replace('TB', '000'));
        return aNum - bNum;
    });
    const colors = [...new Set(iphones.map(phone => phone.color))].sort();
    const countries = [...new Set(iphones.map(phone => phone.country))].sort();

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

    const availableVariants = getAvailableVariants();
    const availableStorages = getAvailableStorages();
    const availableColors = getAvailableColors();
    const availableCountries = getAvailableCountries();

    // Функция для перехода на следующую страницу
    const goToNextPage = useCallback(() => {
        console.log('🚀 Функция goToNextPage вызвана');
        console.log('📍 Текущий URL:', window.location.href);
        
        try {
            // НЕ очищаем состояние при переходе - оно может понадобиться при возврате
            if (typeof window !== 'undefined') {
                console.log('💾 Состояние сохранено, переходим на следующую страницу...');
            }
            
            console.log('🧭 Выполняем router.push...');
            router.push('/request/display_scratches');
            console.log('✅ router.push выполнен');
            
            // Проверяем, что переход действительно произошел
            setTimeout(() => {
                console.log('🔍 Проверка URL после перехода:', window.location.href);
            }, 500);
            
        } catch (error) {
            console.error('❌ Ошибка в goToNextPage:', error);
        }
    }, [router]);

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
            console.log('💾 Сохранено в sessionStorage:', newOptions);
        }
        
        // Сохраняем прогресс в БД (асинхронно, без await)
        if (!isSaving) {
            setIsSaving(true);
            fetch('/api/request/saveProgress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId: 'test_user', // Временно, потом заменим на реальный ID
                    phoneData: newOptions,
                    step: 'phone_selection'
                }),
            })
            .then(response => {
                if (response.ok) {
                    console.log('✅ Прогресс сохранен в БД');
                } else {
                    console.log('❌ Ошибка при сохранении в БД:', response.status, response.statusText);
                    // Показываем пользователю, что произошла ошибка
                    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                        window.Telegram.WebApp.showAlert('Ошибка при сохранении прогресса. Попробуйте еще раз.');
                    }
                }
            })
            .catch(e => {
                console.log('❌ Ошибка при сохранении в БД:', e);
                // Показываем пользователю, что произошла ошибка
                if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                    window.Telegram.WebApp.showAlert('Ошибка сети. Проверьте подключение к интернету.');
                }
            })
            .finally(() => {
                setIsSaving(false);
            });
        }
        
        // Улучшенная интеграция с Telegram WebApp
        // Сохраняем данные в Telegram CloudStorage для надежного восстановления
        callTelegramMethod('web_app_cloud_storage_set', {
            key: 'phoneSelection',
            value: JSON.stringify({
                type: 'phoneSelection',
                data: newOptions,
                timestamp: Date.now(),
                step: 'phone_selection'
            })
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
        
        // Управляем MainButton в зависимости от выбора
        const allOptionsSelected = Object.values(newOptions).every(option => option !== '');
        console.log('🔍 Проверяем выбор опций:', {
            selectedOptions: newOptions,
            allOptionsSelected,
            optionsCount: Object.values(newOptions).filter(option => option !== '').length
        });
        
        // MainButton больше не используется, так как есть желтая кнопка
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

    useEffect(() => {
        if (matchingPhone) {
            const fullName = `Apple iPhone ${matchingPhone.model}${matchingPhone.variant ? ` ${matchingPhone.variant}` : ''}`;
            setModel(fullName);
        }
    }, [matchingPhone, setModel]);

    // Загружаем прогресс из БД при загрузке страницы
    useEffect(() => {
        console.log('🔄 Страница загружена, проверяем сохраненное состояние...');
        
        const loadProgressFromDB = async () => {
            try {
                console.log('🔄 Загружаем прогресс из БД...');
                const response = await fetch('/api/request/saveProgress?telegramId=test_user');
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data?.phoneData) {
                        console.log('✅ Прогресс загружен из БД:', result.data.phoneData);
                        
                        // Обновляем состояние
                        setSelectedOptions(result.data.phoneData);
                        
                        // Сохраняем в sessionStorage для быстрого доступа
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('phoneSelection', JSON.stringify(result.data.phoneData));
                        }
                        
                        // MainButton больше не используется, так как есть желтая кнопка
                    } else {
                        console.log('📝 Прогресс в БД не найден');
                    }
                } else {
                    console.log('❌ Ошибка при загрузке прогресса из БД');
                }
            } catch (e) {
                console.log('❌ Ошибка при загрузке прогресса из БД:', e);
            }
        };

        // Сначала пытаемся восстановить из sessionStorage
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('phoneSelection');
            console.log('📱 Проверяем sessionStorage:', savedInSession);
            
                            if (savedInSession) {
                    try {
                        const parsed = JSON.parse(savedInSession);
                        console.log('✅ Восстановлено из sessionStorage:', parsed);
                        setSelectedOptions(parsed);
                        
                        // MainButton больше не используется, так как есть желтая кнопка
                        
                        return; // Не загружаем из БД, если есть в sessionStorage
                    } catch (e) {
                        console.log('❌ Ошибка при парсинге sessionStorage:', e);
                        sessionStorage.removeItem('phoneSelection'); // Очищаем поврежденные данные
                    }
                }
        }

                    // Если нет данных в sessionStorage, пробуем загрузить из CloudStorage
            console.log('📝 Данных в sessionStorage нет, пробуем CloudStorage...');
            
            // Загружаем из Telegram CloudStorage
            callTelegramMethod('web_app_cloud_storage_get', {
                key: 'phoneSelection',
                callback: (value: string | null) => {
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            if (parsed.data) {
                                console.log('✅ Восстановлено из CloudStorage:', parsed.data);
                                setSelectedOptions(parsed.data);
                                
                                // Сохраняем в sessionStorage для быстрого доступа
                                if (typeof window !== 'undefined') {
                                    sessionStorage.setItem('phoneSelection', JSON.stringify(parsed.data));
                                }
                                
                                // MainButton больше не используется, так как есть желтая кнопка
                                
                                return; // Не загружаем из БД, если есть в CloudStorage
                            }
                        } catch (e) {
                            console.log('❌ Ошибка при парсинге CloudStorage:', e);
                        }
                    }
                    
                    // Если CloudStorage пуст, загружаем из БД
                    console.log('📝 Данных в CloudStorage нет, загружаем из БД...');
                    loadProgressFromDB();
                }
            });
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

    // MainButton больше не используется, так как есть желтая кнопка
        


    // Компонент готов к использованию

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

    const getCountryFlag = (country: string) => {
        const flagMap: { [key: string]: string } = {
            'China 🇨🇳': '🇨🇳',
            'India 🇮🇳': '🇮🇳'
        };
        return flagMap[country] || country;
    };

    return (
        <Page back={true}>
            <div className="w-full max-w-4xl mx-auto">
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 text-center">
                        💡 <strong>Совет:</strong> Если нужные варианты заблокированы, попробуйте выбрать другую модель или вариант
                    </p>
                </div>
                
                {/* Секция выбора модели */}
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Модель</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {models.map((model) => (
                            <button
                                key={model}
                                onClick={() => handleOptionSelect('model', model)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
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
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Вариант</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {variants.map((variant) => {
                            const isDisabled = !availableVariants.includes(variant);
                            return (
                                <button
                                    key={variant}
                                    onClick={() => !isDisabled && handleOptionSelect('variant', variant)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                        isDisabled 
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                            : selectedOptions.variant === variant
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {variant === 'e' ? 'E' : (variant || '')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Секция выбора объема памяти */}
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Объем памяти</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {storages.map((storage) => {
                            const isDisabled = !availableStorages.includes(storage);
                            return (
                                <button
                                    key={storage}
                                    onClick={() => !isDisabled && handleOptionSelect('storage', storage)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                        isDisabled 
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                            : selectedOptions.storage === storage
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {storage}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Секция выбора цвета */}
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Цвет</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {colors.map((color) => {
                            const isDisabled = !availableColors.includes(color);
                            return (
                                <button
                                    key={color}
                                    onClick={() => !isDisabled && handleOptionSelect('color', color)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium relative ${
                                        isDisabled 
                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                            : selectedOptions.color === color
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                                    style={{
                                        backgroundColor: isDisabled ? '#f9fafb' : getColorStyle(color),
                                        color: isDisabled ? '#d1d5db' : (color === 'Wh' || color === 'G' ? '#000' : '#fff')
                                    }}
                                >
                                    <span className="relative z-10 text-center text-sm">
                                        {getColorLabel(color)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Секция выбора страны производителя */}
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Страна производитель</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {countries.map((country) => {
                            const isDisabled = !availableCountries.includes(country);
                            return (
                                <button
                                    key={country}
                                    onClick={() => !isDisabled && handleOptionSelect('country', country)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                        isDisabled 
                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                                            : selectedOptions.country === country
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl mb-1">{getCountryFlag(country)}</span>
                                        <span className="text-xs">{country.split(' ')[0]}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Сводка выбранной конфигурации */}
                {matchingPhone && (
                    <div 
                        className="mt-8 p-4 bg-yellow-400 border-2 border-yellow-500 rounded-lg cursor-pointer hover:bg-yellow-300 transition-colors duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={goToNextPage}
                        title="Нажмите для перехода на следующую страницу"
                    >
                        <p className="text-lg font-bold text-gray-900 text-center">
                            iPhone {matchingPhone.model}
                            {matchingPhone.variant ? ` ${matchingPhone.variant}` : ''}, 
                            {matchingPhone.storage}, 
                            {getColorLabel(matchingPhone.color)}, 
                            {matchingPhone.country.split(' ')[0]}
                        </p>
                        
                        <p className="text-sm text-gray-700 text-center mt-2">
                            👆 Нажмите для продолжения
                        </p>
                        
                    </div>
                )}
            </div>
        </Page>
    );
}


