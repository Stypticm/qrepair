'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';

import appleModels, { IPhone } from '@/core/appleModels';
const { iphones } = appleModels;
import { Button } from '@/components/ui/button';

export default function DeviceConditionPage() {
    const { modelname, setModel, telegramId, username } = useStartForm();
    const router = useRouter();

    // Инициализируем состояние
    const [selectedOptions, setSelectedOptions] = useState({
        model: '',
        variant: null as string | null,
        storage: '',
        color: '',
        country: '',
        simType: ''
    });



    // Функции для умной фильтрации
    const getAvailableVariants = (): string[] => {
        if (!selectedOptions.model) {
            const allVariants = iphones.map((phone: IPhone) => phone.variant).filter((v: string) => v !== '');
            return [...new Set(allVariants)].sort();
        }
        const filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        const variants = [...new Set(filteredPhones.map((phone: IPhone) => phone.variant))];
        return variants.filter((v: string) => v !== '').sort();
    };

    const getAvailableStorages = (): string[] => {
        if (!selectedOptions.model) {
            return [...new Set(iphones.map((phone: IPhone) => phone.storage))].sort((a: string, b: string) => {
                const aNum = parseInt(a.replace('GB', '').replace('TB', '000'));
                const bNum = parseInt(b.replace('GB', '').replace('TB', '000'));
                return aNum - bNum;
            });
        }
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        return [...new Set(filteredPhones.map((phone: IPhone) => phone.storage))];
    };

    const getAvailableColors = (): string[] => {
        if (!selectedOptions.model) {
            return [...new Set(iphones.map((phone: IPhone) => phone.color))].sort();
        }
        let filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        if (selectedOptions.variant) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.variant === selectedOptions.variant);
        }
        if (selectedOptions.storage) {
            filteredPhones = filteredPhones.filter((phone: IPhone) => phone.storage === selectedOptions.storage);
        }
        
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        return [...new Set(filteredPhones.map((phone: IPhone) => phone.color))];
    };

    const getAvailableCountries = (): string[] => {
        const validCountries = [
            'Китай 🇨🇳',
            'США 🇺🇸', 
            'Европа 🇪🇺',
            'ОАЭ 🇦🇪'
        ];
        
        if (!selectedOptions.model) {
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
        
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        const availableCountries = [...new Set(filteredPhones.map((phone: IPhone) => phone.country))];
        return validCountries.filter(country => availableCountries.includes(country));
    };

    const getAvailableSimTypes = (): string[] => {
        if (!selectedOptions.model) {
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
        
        if (filteredPhones.length === 0) {
            filteredPhones = iphones.filter((phone: IPhone) => phone.model === selectedOptions.model);
        }
        
        return [...new Set(filteredPhones.map((phone: IPhone) => phone.simType))];
    };

    // Проверяем, все ли опции выбраны
    const isAllOptionsSelected = () => {
        return selectedOptions.model && selectedOptions.variant !== null && selectedOptions.storage && selectedOptions.color && selectedOptions.country && selectedOptions.simType;
    };

    // Обработчик выбора опции
    const handleOptionSelect = (type: string, value: string) => {
        const newOptions = { ...selectedOptions };
        
        if (type === 'model') {
            newOptions.model = value;
            newOptions.variant = null;
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'variant') {
            newOptions.variant = value;
            newOptions.storage = '';
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'storage') {
            newOptions.storage = value;
            newOptions.color = '';
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'color') {
            newOptions.color = value;
            newOptions.country = '';
            newOptions.simType = '';
        } else if (type === 'country') {
            newOptions.country = value;
            newOptions.simType = '';
        } else if (type === 'simType') {
            newOptions.simType = value;
        }
        
        setSelectedOptions(newOptions);
    };

    // Находим подходящий телефон
    const findMatchingPhone = () => {
        return iphones.find((phone: IPhone) => 
            phone.model === selectedOptions.model &&
            phone.variant === selectedOptions.variant &&
            phone.storage === selectedOptions.storage &&
            phone.color === selectedOptions.color &&
            phone.country === selectedOptions.country &&
            phone.simType === selectedOptions.simType
        );
    };

    // Обработчик продолжения
    const handleContinueToNext = () => {
        if (isAllOptionsSelected()) {
            const matchingPhone = findMatchingPhone();
            if (matchingPhone) {
                const fullModelName = `${matchingPhone.model} ${matchingPhone.variant} ${matchingPhone.storage} ${matchingPhone.color} ${matchingPhone.country} ${matchingPhone.simType}`;
                setModel(fullModelName);
                router.push('/request/phone-condition');
            }
        }
    };

    // Создаем заявку при загрузке страницы
    useEffect(() => {
        const createRequest = async () => {
            try {
                await fetch('/api/request/choose', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegramId,
                        username
                    }),
                });
            } catch (error) {
                console.error('Error creating request:', error);
            }
        };

        if (telegramId && username) {
            createRequest();
        }
    }, [telegramId, username]);

    // Восстанавливаем состояние из sessionStorage
    useEffect(() => {
        const savedState = sessionStorage.getItem('deviceFormState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.variant === '') {
                    parsed.variant = null;
                }
                setSelectedOptions(parsed);
            } catch (error) {
                console.error('Error parsing saved state:', error);
            }
        }
    }, []);

    // Сохраняем состояние в sessionStorage
    useEffect(() => {
        sessionStorage.setItem('deviceFormState', JSON.stringify(selectedOptions));
    }, [selectedOptions]);

    // Получаем цвет для отображения
    const getColorLabel = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'Black': 'Черный',
            'White': 'Белый',
            'Gold': 'Золотой',
            'Silver': 'Серебряный',
            'Blue': 'Синий',
            'Red': 'Красный',
            'Green': 'Зеленый',
            'Purple': 'Фиолетовый',
            'Pink': 'Розовый',
            'Yellow': 'Желтый',
            'Orange': 'Оранжевый',
            'Midnight': 'Полуночный',
            'Starlight': 'Звездный свет',
            'Natural': 'Натуральный',
            'Titan': 'Титан',
            'Space Black': 'Космический черный',
            'Space Gray': 'Космический серый',
            'Rose Gold': 'Розовое золото',
            'Jet Black': 'Глянцевый черный',
            'Product Red': 'Красный Product Red'
        };
        return colorMap[color] || color;
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="w-full max-w-md mx-auto space-y-4">
                        {/* Модель */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {[...new Set(iphones.map((phone: IPhone) => phone.model))].sort().map((model: string) => (
                                    <Button
                                        key={model}
                                        onClick={() => handleOptionSelect('model', model)}
                                        disabled={!selectedOptions.model}
                                        className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            selectedOptions.model === model
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {model}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Вариант */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {getAvailableVariants().map((variant: string) => (
                                    <Button
                                        key={variant}
                                        onClick={() => handleOptionSelect('variant', variant)}
                                        disabled={!selectedOptions.model}
                                        className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            selectedOptions.variant === variant
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {variant}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Объем памяти */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {getAvailableStorages().map((storage: string) => (
                                    <Button
                                        key={storage}
                                        onClick={() => handleOptionSelect('storage', storage)}
                                        disabled={!selectedOptions.model || !selectedOptions.variant}
                                        className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            selectedOptions.storage === storage
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {storage}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Цвет */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="flex justify-around gap-2">
                                {getAvailableColors().map((color: string) => (
                                    <Button
                                        key={color}
                                        onClick={() => handleOptionSelect('color', color)}
                                        disabled={!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage}
                                        className={`h-10 w-10 rounded-full p-0 transition-all duration-200 ${
                                            selectedOptions.color === color
                                                ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                                                : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        title={getColorLabel(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Тип SIM */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage || !selectedOptions.color ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {getAvailableSimTypes().map((simType: string) => (
                                    <Button
                                        key={simType}
                                        onClick={() => handleOptionSelect('simType', simType)}
                                        disabled={!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage || !selectedOptions.color}
                                        className={`h-8 rounded-lg border transition-all duration-200 text-xs font-medium ${
                                            selectedOptions.simType === simType
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {simType}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Страна производитель */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage || !selectedOptions.color || !selectedOptions.simType ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {getAvailableCountries().map((country: string) => (
                                    <Button
                                        key={country}
                                        onClick={() => handleOptionSelect('country', country)}
                                        disabled={!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage || !selectedOptions.color || !selectedOptions.simType}
                                        className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            selectedOptions.country === country
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        {country}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка продолжения */}
                        {isAllOptionsSelected() && (
                            <Button
                                onClick={handleContinueToNext}
                                className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                Продолжить
                            </Button>
                        )}
                    </div>
                </div>
            </div>


        </Page>
    );
}
