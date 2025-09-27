'use client'

import { useRouter } from 'next/navigation';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useDevices, Device } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/authStore';

export default function DeviceConditionPage() {
    const { modelname, setModel, telegramId, username, setPrice } = useAppStore();
    const router = useRouter();
    const { goBack } = useStepNavigation();
    const devices = useDevices();

    // Инициализируем состояние
    const [selectedOptions, setSelectedOptions] = useState({
        model: '',
        variant: null as string | null,
        storage: '',
        color: ''
    });


    // Загружаем данные при изменении фильтров
    useEffect(() => {
        const { model, variant, storage } = selectedOptions;
        if (model) {
            // Загружаем варианты, только если они еще не загружены для этой модели
            if (devices.variants.length === 0) devices.loadVariants(model);

            if (variant !== null && variant !== undefined) {
                // Загружаем хранилища, только если они еще не загружены
                if (devices.storages.length === 0) devices.loadStorages({ model, variant });

                if (storage) {
                    // Загружаем цвета, только если они еще не загружены
                    if (devices.colors.length === 0) devices.loadColors({ model, variant, storage });
                }
            }
        }
    }, [selectedOptions, devices]);

    // Проверяем, все ли опции выбраны
    const isAllOptionsSelected = useCallback(() => {
        return selectedOptions.model && selectedOptions.variant !== null && selectedOptions.storage && selectedOptions.color;
    }, [selectedOptions]);

    // Загружаем устройство и цену когда все выбрано
    useEffect(() => {
        if (isAllOptionsSelected()) {
            devices.loadDevice({
                model: selectedOptions.model,
                variant: selectedOptions.variant || '',
                storage: selectedOptions.storage,
                color: selectedOptions.color
            });
        }
    }, [selectedOptions, devices, isAllOptionsSelected]);

    // Обработчик выбора опции
    const handleOptionSelect = (type: string, value: string) => {
        const newOptions = { ...selectedOptions };

        if (type === 'model') {
            newOptions.model = value;
            newOptions.variant = null;
            newOptions.storage = '';
            newOptions.color = '';
            devices.clearFilters();
        } else if (type === 'variant') {
            newOptions.variant = value;
            newOptions.storage = '';
            newOptions.color = '';
        } else if (type === 'storage') {
            newOptions.storage = value;
            newOptions.color = '';
        } else if (type === 'color') {
            newOptions.color = value;
        }

        setSelectedOptions(newOptions);
    };

    // Обработчик продолжения
    const handleContinueToNext = () => {
        if (isAllOptionsSelected() && devices.selectedDevice) {
            const device = devices.selectedDevice;
            const fullModelName = `${device.model} ${device.variant} ${device.storage} ${device.color}`;
            setModel(fullModelName);
            setPrice(device.basePrice);

            // Сохраняем выбор в sessionStorage
            sessionStorage.setItem('phoneSelection', JSON.stringify({
                model: device.model,
                variant: device.variant,
                storage: device.storage,
                color: device.color,
                basePrice: device.basePrice
            }));

            router.push('/request/phone-condition');
        }
    };

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
        <Page back={goBack}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="w-full max-w-md mx-auto space-y-4">
                        {/* Модель */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {devices.loading.models ? (
                                    <div className="text-center py-4 text-gray-500">Загрузка моделей...</div>
                                ) : (
                                    devices.models.map((model: string) => (
                                        <Button
                                            key={`model-${model}`}
                                            onClick={() => handleOptionSelect('model', model)}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.model === model
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {model}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Вариант */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {devices.loading.variants ? (
                                    <div className="text-center py-4 text-gray-500">Загрузка вариантов...</div>
                                ) : (
                                    devices.variants.map((variant: string) => (
                                        <Button
                                            key={`variant-${variant}`}
                                            onClick={() => handleOptionSelect('variant', variant)}
                                            disabled={!selectedOptions.model}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.variant === variant
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {variant}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Объем памяти */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 gap-1">
                                {devices.loading.storages ? (
                                    <div className="text-center py-4 text-gray-500">Загрузка объемов...</div>
                                ) : (
                                    devices.storages.map((storage: string) => (
                                        <Button
                                            key={`storage-${storage}`}
                                            onClick={() => handleOptionSelect('storage', storage)}
                                            disabled={!selectedOptions.model || !selectedOptions.variant}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.storage === storage
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {storage}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Цвет */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 ${!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                            <div className="flex justify-around gap-2">
                                {devices.loading.colors ? (
                                    <div className="text-center py-4 text-gray-500">Загрузка цветов...</div>
                                ) : (
                                    devices.colors.map((color: string) => (
                                        <Button
                                            key={`color-${color}`}
                                            onClick={() => handleOptionSelect('color', color)}
                                            disabled={!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage}
                                            className={`h-10 w-10 rounded-full p-0 transition-all duration-200 ${selectedOptions.color === color
                                                    ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={getColorLabel(color)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Кнопка продолжения */}
                        {isAllOptionsSelected() && devices.selectedDevice && (
                            <div className="space-y-3">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">
                                        Базовая цена: {devices.selectedDevice.basePrice.toLocaleString()} ₽
                                    </div>
                                </div>
                                <Button
                                    onClick={handleContinueToNext}
                                    className="w-full h-14 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
                                >
                                    Продолжить
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </Page>
    );
}
