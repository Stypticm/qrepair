'use client'

import { useRouter } from 'next/navigation';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEffect } from 'react';
import { Page } from '@/components/Page';
import { useDevices } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/authStore';

export default function DeviceConditionPage() {
    const { setModel, setPrice } = useAppStore();
    const router = useRouter();
    const { goBack } = useStepNavigation();
    const {
        models,
        variants,
        storages,
        colors,
        selectedDevice,
        selectedOptions,
        handleOptionSelect,
        isLoading,
        error
    } = useDevices();

    // Process the fully selected device
    useEffect(() => {
        if (selectedDevice) {
            const { model, variant, storage, color, basePrice } = selectedDevice;
            const fullModelName = `${model} ${variant} ${storage} ${color}`;
            setModel(fullModelName);
            setPrice(basePrice);
        }
    }, [selectedDevice, setModel, setPrice]);

    const handleContinueToNext = () => {
        if (selectedDevice) {
            // Save selection to sessionStorage for the next step
            sessionStorage.setItem('phoneSelection', JSON.stringify({
                ...selectedOptions,
                basePrice: selectedDevice.basePrice
            }));
            router.push('/request/phone-condition');
        }
    };

    const getColorLabel = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'Black': 'Черный', 'White': 'Белый', 'Gold': 'Золотой', 'Silver': 'Серебряный',
            'Blue': 'Синий', 'Red': 'Красный', 'Green': 'Зеленый', 'Purple': 'Фиолетовый',
            'Pink': 'Розовый', 'Yellow': 'Желтый', 'Orange': 'Оранжевый', 'Midnight': 'Полуночный',
            'Starlight': 'Звездный свет', 'Natural': 'Натуральный', 'Titan': 'Титан',
            'Space Black': 'Космический черный', 'Space Gray': 'Космический серый', 'Rose Gold': 'Розовое золото',
            'Jet Black': 'Глянцевый черный', 'Product Red': 'Красный Product Red'
        };
        return colorMap[color] || color;
    };

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <Page back={goBack}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="w-full max-w-md mx-auto space-y-4">
                        {/* Модель */}
                        <div className={`p-3 rounded-xl border transition-all duration-200 bg-white`}>
                            {isLoading ? (
                                <div className="text-center py-4 text-gray-500">Загрузка моделей...</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-1">
                                    {models.map((model: string) => (
                                        <Button
                                            key={`model-${model}`}
                                            onClick={() => handleOptionSelect('model', model)}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.model === model ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                            {model}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Вариант */}
                        {selectedOptions.model && (
                            <div className={`p-3 rounded-xl border transition-all duration-200 bg-white`}>
                                <div className="grid grid-cols-1 gap-1">
                                    {variants.map((variant: string) => (
                                        <Button
                                            key={`variant-${variant}`}
                                            onClick={() => handleOptionSelect('variant', variant)}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.variant === variant ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                            {variant}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Объем памяти */}
                        {selectedOptions.variant && (
                            <div className={`p-3 rounded-xl border transition-all duration-200 bg-white`}>
                                <div className="grid grid-cols-1 gap-1">
                                    {storages.map((storage: string) => (
                                        <Button
                                            key={`storage-${storage}`}
                                            onClick={() => handleOptionSelect('storage', storage)}
                                            className={`h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${selectedOptions.storage === storage ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                            {storage}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Цвет */}
                        {selectedOptions.storage && (
                            <div className={`p-3 rounded-xl border transition-all duration-200 bg-white`}>
                                <div className="flex justify-around gap-2">
                                    {colors.map((color: string) => (
                                        <Button
                                            key={`color-${color}`}
                                            onClick={() => handleOptionSelect('color', color)}
                                            className={`h-10 w-10 rounded-full p-0 transition-all duration-200 ${selectedOptions.color === color ? 'border-2 border-blue-500 bg-blue-50 shadow-md' : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={getColorLabel(color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedDevice && (
                            <div className="space-y-3">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">
                                        Базовая цена: {selectedDevice.basePrice.toLocaleString()} ₽
                                    </div>
                                </div>
                                <Button
                                    onClick={handleContinueToNext}
                                    className="w-full h-14 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold text-lg rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl">
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