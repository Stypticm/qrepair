'use client'

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useDevices } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getPictureUrl } from '@/core/lib/assets';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import Image from 'next/image';

export default function FormPage() {
    const { setModel, telegramId, username, setPrice, setCurrentStep } = useAppStore();
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
        error,
    } = useDevices();

    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setCurrentStep('form');
    }, [setCurrentStep]);

    // Save selection to session storage for quick recovery
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('phoneSelection', JSON.stringify(selectedOptions));
        }
    }, [selectedOptions]);

    // Process the fully selected device
    useEffect(() => {
        if (selectedDevice) {
            const fullName = `Apple iPhone ${selectedDevice.model}${selectedDevice.variant ? ` ${getVariantLabel(selectedDevice.variant)}` : ''} ${selectedDevice.storage} ${getColorLabel(selectedDevice.color)}`;
            setModel(fullName);
            setPrice(selectedDevice.basePrice);
            sessionStorage.setItem('basePrice', selectedDevice.basePrice.toString());
            saveModelToDB(fullName);
            setShowSummaryDialog(true);
        }
    }, [selectedDevice, setModel, setPrice]);

    const saveModelToDB = useCallback(async (modelName: string) => {
        if (telegramId) {
            try {
                await fetch('/api/request/model', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegramId, modelname: modelName }),
                });
            } catch (error) {
                console.error('Error saving model to DB:', error);
            }
        }
    }, [telegramId]);

    const handleContinueToNext = async () => {
        if (isNavigating || !selectedDevice) return;

        setIsNavigating(true);
        setShowSummaryDialog(false);

        if (telegramId) {
            try {
                await fetch('/api/request/choose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegramId,
                        username: username || 'Unknown',
                        currentStep: 'condition',
                        modelname: `Apple iPhone ${selectedDevice.model}${selectedDevice.variant ? ` ${getVariantLabel(selectedDevice.variant)}` : ''} ${selectedDevice.storage} ${getColorLabel(selectedDevice.color)}`,
                        price: selectedDevice.basePrice
                    })
                });
            } catch (error) {
                console.error('Error updating currentStep:', error);
                setIsNavigating(false);
                return;
            }
        }
        router.push('/request/condition');
    };

    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

    const getColorLabel = (color: string) => {
        const colorMap: { [key: string]: string } = { 'G': 'Золотой', 'R': 'Красный', 'Bl': 'Синий', 'Wh': 'Белый', 'C': 'Черный', 'Bk': 'Черный', 'La': 'Лаванда', 'Mi': 'Туманный синий', 'Sa': 'Шалфей' };
        return colorMap[color] || color;
    };

    const getVariantLabel = (variant: string) => {
        if (!variant) return '';
        const variantMap: { [key: string]: string } = { 'R': 'R', 'S': 'S', 'S Max': 'S Max', 'Pro': 'Pro', 'Pro Max': 'Pro Max', 'mini': 'Mini', 'Plus': 'Plus', 'se': 'SE' };
        return variantMap[variant] || variant;
    };

    const getColorStyle = (color: string) => {
        const colorMap: { [key: string]: string } = { 'G': '#F5D76E', 'R': '#E74C3C', 'Bl': '#3498DB', 'Wh': '#F8F9FA', 'C': '#2C3E50', 'Bk': '#000000', 'La': '#E6E6FA', 'Mi': '#B0C4DE', 'Sa': '#9DC183' };
        return colorMap[color] || '#808080';
    };

    if (error) {
        return <div>Error loading devices: {error.message}</div>
    }

    return (
        <LazyMotion features={domAnimation}>
            {isNavigating && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                        <Image src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Переходим к оценке...</p>
                    </div>
                </div>
            )}

            <Page back={goBack}>
                <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-12 overflow-hidden">
                    <div className="pb-1">
                        <ProgressBar currentStep={2} totalSteps={5} steps={steps} />
                    </div>

                    <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto flex flex-col gap-1 pb-4">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm">
                                <h3 className="text-center font-semibold text-gray-900 mb-2 text-lg">Модель</h3>
                                {isLoading && models.length === 0 && (
                                    <div className="grid grid-cols-4 gap-1 animate-pulse">
                                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-full h-7 rounded-lg bg-gray-200"></div>)}
                                    </div>
                                )}
                                {models.length > 0 && (
                                    <div className="grid grid-cols-4 gap-1">
                                        {models.map((model: string) => (
                                            <motion.div key={model} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.15 }}>
                                                <Button onClick={() => handleOptionSelect('model', model)} className={`w-full h-7 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.model === model ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                                    {selectedOptions.model === model && <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10"><span className="text-white text-xs font-bold">✓</span></div>}
                                                    {model}
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {selectedOptions.model && variants.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="p-2 rounded-xl shadow-sm bg-white">
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Вариант</h3>
                                    <div className="grid grid-cols-3 gap-1">
                                        {variants.map((variant: string) => (
                                            <Button key={variant} onClick={() => handleOptionSelect('variant', variant)} className={`w-full h-7 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.variant === variant ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                                {selectedOptions.variant === variant && <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10"><span className="text-white text-xs font-bold">✓</span></div>}
                                                {getVariantLabel(variant) || 'Стандарт'}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {selectedOptions.model && storages.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="p-2 rounded-xl shadow-sm bg-white">
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Объем памяти</h3>
                                    <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
                                        {storages.map((storage: string) => (
                                            <Button key={storage} onClick={() => handleOptionSelect('storage', storage)} className={`h-8 rounded-lg border transition-all duration-200 text-sm font-medium flex items-center justify-center truncate relative ${selectedOptions.storage === storage ? 'border-[#2dc2c6] bg-[#2dc2c6]/10 text-[#2dc2c6] shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'}`}>
                                                {selectedOptions.storage === storage && <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10"><span className="text-white text-xs font-bold">✓</span></div>}
                                                {storage}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {selectedOptions.model && colors.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="p-2 rounded-xl shadow-sm bg-white">
                                    <h3 className="text-center font-semibold text-gray-900 mb-1 text-lg">Цвет</h3>
                                    <div className="flex flex-row justify-around gap-2">
                                        {colors.map((color: string) => (
                                            <Button key={color} onClick={() => handleOptionSelect('color', color)} className={`h-8 w-8 rounded-full border-2 transition-all duration-200 relative group flex items-center justify-between p-0 ${selectedOptions.color === color ? 'border-[#2dc2c6] ring-2 ring-[#2dc2c6]/30 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`} style={{ backgroundColor: getColorStyle(color) }} title={getColorLabel(color)}>
                                                {selectedOptions.color === color && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10"><span className="text-white text-xs font-bold">✓</span></div>}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                                <DialogContent className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg" onClick={handleContinueToNext} showCloseButton={false}>
                                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">📱 Ваша полная конфигурация</DialogTitle>
                                    {selectedDevice && (
                                        <>
                                            <div className="text-center space-y-4">
                                                <div className="bg-[#2dc2c6]/10 p-4 rounded-xl border border-[#2dc2c6]">
                                                    <p className="text-lg font-semibold text-gray-900 break-words leading-tight">
                                                        iPhone {selectedDevice.model}
                                                        {selectedDevice.variant ? ` ${getVariantLabel(selectedDevice.variant)}` : ''}
                                                        {selectedDevice.storage ? ` ${selectedDevice.storage}` : ''}
                                                        {selectedDevice.color ? ` ${getColorLabel(selectedDevice.color)}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-center text-sm text-gray-600 mt-4">👆 Нажмите на окно для перехода к следующему шагу</p>
                                            <p className="text-center text-sm text-gray-600 mt-1">✏️ Нажмите вне поля, если хотите отредактировать свой выбор</p>
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