'use client'

import { useEffect, useState } from 'react'
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
    const goToNextPage = () => {
        // Очищаем сохраненное состояние при переходе
        if (typeof window !== 'undefined') {
            console.log('🧹 Очищаем сохраненное состояние...');
            // Очищаем только sessionStorage, localStorage больше не используем
            sessionStorage.removeItem('phoneSelection');
            console.log('✅ Состояние очищено');
        }
        router.push('/request/display_scratches');
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
        
        // Сохраняем прогресс в БД (асинхронно, без await)
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
                console.log('❌ Ошибка при сохранении в БД');
            }
        })
        .catch(e => {
            console.log('❌ Ошибка при сохранении в БД:', e);
        });
        
        // Улучшенная интеграция с Telegram WebApp
        try {
            if (window.Telegram?.WebApp) {
                const webApp = window.Telegram.WebApp;
                
                // Отправляем данные в Telegram для возможного восстановления
                webApp.sendData(JSON.stringify({
                    type: 'phoneSelection',
                    data: newOptions,
                    timestamp: Date.now(),
                    step: 'phone_selection'
                }));
                console.log('📤 Данные отправлены в Telegram WebApp');
                
                // Показываем уведомление пользователю
                webApp.HapticFeedback.impactOccurred('light');
                
                // Если все опции выбраны, показываем MainButton
                if (Object.values(newOptions).every(option => option !== '')) {
                    webApp.MainButton.setText('Продолжить');
                    webApp.MainButton.show();
                    webApp.MainButton.onClick(() => {
                        goToNextPage();
                    });
                } else {
                    webApp.MainButton.hide();
                }
            }
        } catch (e) {
            console.log('❌ Не удалось отправить данные в Telegram:', e);
        }
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

        // Загружаем прогресс только если нет данных в sessionStorage
        if (typeof window !== 'undefined' && !sessionStorage.getItem('phoneSelection')) {
            loadProgressFromDB();
        }
    }, []);

    // Инициализация Telegram WebApp при загрузке
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;
            
            // Уведомляем Telegram о готовности приложения
            webApp.ready();
            
            // Расширяем приложение на весь экран
            webApp.expand();
            
            // Устанавливаем цвета заголовка
            webApp.headerColor = '#FF6B35';
            webApp.backgroundColor = '#FFFFFF';
            
            console.log('🚀 Telegram WebApp инициализирован');
        }
    }, []);

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
                    <div className="mt-8 p-4 bg-yellow-400 border-2 border-yellow-500 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 text-center mb-4">
                            iPhone {matchingPhone.model}
                            {matchingPhone.variant ? ` ${matchingPhone.variant}` : ''}, 
                            {matchingPhone.storage}, 
                            {getColorLabel(matchingPhone.color)}, 
                            {matchingPhone.country.split(' ')[0]}
                        </p>
                        
                        {/* Кнопка "Далее" */}
                        <div className="text-center">
                            <button
                                onClick={goToNextPage}
                                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Далее →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Page>
    );
}


