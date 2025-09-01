'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function DeviceInfoPage() {
    const {
        telegramId,
        imei,
        serialNumber,
        setImei,
        setSerialNumber,
        resetAllStates
    } = useStartForm();
    const router = useRouter();

    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Состояние для отслеживания изменений
    const [hasChanges, setHasChanges] = useState(false);

    // Состояние для режима редактирования
    const [isEditing, setIsEditing] = useState(false);
    
    // Состояние для определения, все ли выбрано
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Шаги для прогресс-бара
    const steps = ['Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'IMEI и S/N', 'Подтверждение'];

    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        return 4;
    };

    // Загрузка сохраненных данных из sessionStorage
    const loadSavedData = useCallback(async () => {
        console.log('Загружаю сохраненные IMEI и S/N...');

        if (typeof window !== 'undefined') {
            // Проверяем, есть ли данные о выборе модели (новая заявка)
            const phoneSelection = sessionStorage.getItem('phoneSelection');
            
            if (!phoneSelection) {
                // Новая заявка - очищаем старые данные
                console.log('[loadSavedData] Новая заявка - очищаем старые данные IMEI и S/N');
                resetAllStates();
                return;
            }

            const savedImei = sessionStorage.getItem('imei');
            const savedSerialNumber = sessionStorage.getItem('serialNumber');
            
            if (savedImei) {
                setImei(savedImei);
                console.log('[loadSavedData] IMEI загружен из sessionStorage:', savedImei);
            }
            
            if (savedSerialNumber) {
                setSerialNumber(savedSerialNumber);
                console.log('[loadSavedData] S/N загружен из sessionStorage:', savedSerialNumber);
            }

            // Проверяем, есть ли уже введенные данные (режим редактирования)
            if (savedImei || savedSerialNumber) {
                setIsEditing(true);
                // Проверяем, все ли заполнено
                const allFilled = savedImei && savedImei.length === 15 && 
                                savedSerialNumber && savedSerialNumber.length >= 10;
                setIsAllSelected(!!allFilled);
                setHasChanges(true);
            }
        }
    }, [setImei, setSerialNumber, resetAllStates]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        loadSavedData();
    }, [loadSavedData]);

    // Проверяем, заполнены ли все поля
    const areAllFieldsFilled = useCallback(() => {
        return imei && imei.length === 15 &&
               serialNumber && serialNumber.length >= 10;
    }, [imei, serialNumber]);

    // Показываем диалог когда все поля заполнены
    useEffect(() => {
        if (areAllFieldsFilled() && hasChanges) {
            console.log('[useEffect] Показываем диалог - все поля заполнены');
            setShowDialog(true);
            
            // Устанавливаем флаг "все заполнено"
            setIsAllSelected(true);
        }
    }, [imei, serialNumber, areAllFieldsFilled, hasChanges]);

    // Обработчики диалогового окна
    const handleContinue = () => {
        setShowDialog(false);
        // Принудительно закрываем диалог в DOM и убираем backdrop
        setTimeout(() => {
            const dialogs = document.querySelectorAll('[role="dialog"]');
            dialogs.forEach(dialog => {
                if (dialog instanceof HTMLElement) {
                    dialog.style.display = 'none';
                }
            });

            // Убираем backdrop (серый фон)
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
            backdrops.forEach(backdrop => {
                if (backdrop instanceof HTMLElement) {
                    backdrop.style.display = 'none';
                }
            });
        }, 0);
        // Быстрый переход без задержки
        router.push('/request/submit');
    };

    const handleEdit = () => {
        setShowDialog(false);
        // При редактировании сбрасываем флаг изменений
        setHasChanges(false);

        // Убираем backdrop (серый фон) при редактировании
        setTimeout(() => {
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
            backdrops.forEach(backdrop => {
                if (backdrop instanceof HTMLElement) {
                    backdrop.style.display = 'none';
                }
            });
        }, 50);
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                {/* Прогресс-бар */}
                <div className="pt-2 pb-1">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-3 pt-2 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-1 pb-4">

                        {/* IMEI поле */}
                        {true && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800 text-center">IMEI</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            IMEI (15 цифр)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={imei || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                                                    setImei(value);
                                                    setHasChanges(true);
                                                    
                                                    // Сбрасываем режим редактирования при новом вводе
                                                    setIsEditing(false);
                                                    setIsAllSelected(false);
                                                    
                                                    // Сохраняем в sessionStorage
                                                    if (typeof window !== 'undefined') {
                                                        sessionStorage.setItem('imei', value);
                                                    }
                                                }}
                                                placeholder="Введите IMEI"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent"
                                                maxLength={15}
                                            />
                                            {imei && imei.length === 15 && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                            <strong>Как найти IMEI:</strong><br/>
                                            • На iPhone: Настройки → Основные → Об этом устройстве → IMEI<br/>
                                            • На коробке: 15-значный код на наклейке<br/>
                                            • На задней панели: Выгравирован мелким шрифтом<br/>
                                            <br/>
                                            <strong>💡 Если не знаете IMEI, введите: 111111111111111</strong>
                                        </div>
                                        
                                        {/* Кнопка "Не знаю" для IMEI */}
                                        <button
                                            onClick={() => {
                                                const defaultImei = '111111111111111';
                                                setImei(defaultImei);
                                                setHasChanges(true);
                                                setIsEditing(false);
                                                setIsAllSelected(false);
                                                
                                                if (typeof window !== 'undefined') {
                                                    sessionStorage.setItem('imei', defaultImei);
                                                }
                                            }}
                                            className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                                        >
                                            🤔 Не знаю IMEI - заполнить автоматически
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* S/N поле */}
                        {imei && imei.length === 15 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="p-2 rounded-xl shadow-sm bg-white"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-800 text-center">Серийный номер (S/N)</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Серийный номер (S/N)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={serialNumber || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
                                                    setSerialNumber(value);
                                                    setHasChanges(true);
                                                    
                                                    // Сбрасываем режим редактирования при новом вводе
                                                    setIsEditing(false);
                                                    setIsAllSelected(false);
                                                    
                                                    // Сохраняем в sessionStorage
                                                    if (typeof window !== 'undefined') {
                                                        sessionStorage.setItem('serialNumber', value);
                                                    }
                                                }}
                                                placeholder="Введите S/N"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent"
                                                maxLength={12}
                                            />
                                            {serialNumber && serialNumber.length >= 10 && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center shadow-sm z-10">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                            <strong>Как найти S/N:</strong><br/>
                                            • На iPhone: Настройки → Основные → Об этом устройстве → Серийный номер<br/>
                                            • На коробке: 12-значный код на наклейке<br/>
                                            • На задней панели: Выгравирован мелким шрифтом<br/>
                                            <br/>
                                            <strong>💡 Если не знаете S/N, введите: 111111111111</strong>
                                        </div>
                                        
                                        {/* Кнопка "Не знаю" для S/N */}
                                        <button
                                            onClick={() => {
                                                const defaultSerialNumber = '111111111111';
                                                setSerialNumber(defaultSerialNumber);
                                                setHasChanges(true);
                                                setIsEditing(false);
                                                setIsAllSelected(false);
                                                
                                                if (typeof window !== 'undefined') {
                                                    sessionStorage.setItem('serialNumber', defaultSerialNumber);
                                                }
                                            }}
                                            className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                                        >
                                            🤔 Не знаю S/N - заполнить автоматически
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Диалоговое окно с итоговой информацией */}
            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    onClick={handleContinue}
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                        Проверьте данные
                    </DialogTitle>

                    <div className="text-center">
                        {/* Рамка для выбранных данных */}
                        <div className="bg-[#2dc2c6]/10 rounded-2xl p-5 border border-[#2dc2c6] shadow-lg mb-4">
                            <div className="space-y-3">
                                {imei && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">IMEI:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {imei}
                                        </span>
                                    </div>
                                )}
                                {serialNumber && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">S/N:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {serialNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-3">
                            👆 Нажмите на окно для перехода к следующему шагу
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">
                            ✏️ Нажмите вне поля, если хотите отредактировать свой выбор
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
