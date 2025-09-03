'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useNavigation } from '@/components/NavigationContext/NavigationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function DeviceInfoPage() {
    const {
        telegramId,
        serialNumber,
        setSerialNumber,
        resetAllStates
    } = useStartForm();
    const { setCurrentStep } = useNavigation();
    const router = useRouter();

    // Состояние для ручного ввода S/N
    const [manualSerialNumber, setManualSerialNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('device-info');
    }, [setCurrentStep]);

    // Загружаем сохраненный серийный номер
    useEffect(() => {
        if (serialNumber) {
            setManualSerialNumber(serialNumber);
            setIsValid(true);
        }
    }, [serialNumber]);

    // Шаги для прогресс-бара
    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        return 1;
    };

    // Функция для валидации серийного номера
    const validateSerialNumber = (sn: string): boolean => {
        // Проверяем длину от 10 до 12 символов
        if (sn.length < 10 || sn.length > 12) {
            return false;
        }
        
        // Проверяем, что содержит только буквы и цифры
        if (!/^[A-Za-z0-9]+$/.test(sn)) {
            return false;
        }
        
        return true;
    };

    // Обработчик изменения ввода
    const handleInputChange = (value: string) => {
        setManualSerialNumber(value);
        setError('');
        
        if (value.length === 0) {
            setIsValid(false);
        } else if (validateSerialNumber(value)) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    };

    // Обработчик подтверждения
    const handleConfirm = async () => {
        if (!isValid || !manualSerialNumber) {
            setError('Пожалуйста, введите корректный серийный номер');
            return;
        }

        try {
            // Сохраняем в контекст
            setSerialNumber(manualSerialNumber);

            // Сохраняем в БД
            const response = await fetch('/api/request/device-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    serialNumber: manualSerialNumber,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения данных');
            }

            // Переходим на следующую страницу
            router.push('/request/form');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setError('Ошибка сохранения данных. Попробуйте еще раз.');
        }
    };

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                {/* Прогресс-бар */}
                <div className="pt-0 pb-0">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-4 pt-2 flex flex-col overflow-y-auto">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-4 pb-4">

                        {/* Заголовок */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Серийный номер
                            </h2>
                            <p className="text-sm text-gray-500">
                                Введите серийный номер устройства
                            </p>
                        </motion.div>

                        {/* Инструкция */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">ℹ️</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-2">Где найти серийный номер?</h4>
                                            <div className="text-sm text-blue-800 space-y-1">
                                                <p>• Настройки → Основные → Об этом устройстве</p>
                                                <p>• На коробке устройства</p>
                                                <p>• На задней панели (для старых моделей)</p>
                                                <p>• В iTunes/Finder при подключении к компьютеру</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Поле ввода */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.2 }}
                        >
                            <Card className="bg-white border-gray-200">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Серийный номер
                                            </label>
                                            <input
                                                type="text"
                                                value={manualSerialNumber}
                                                onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                                placeholder="Введите серийный номер"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors"
                                                maxLength={12}
                                            />
                                        </div>
                                        
                                        {error && (
                                            <div className="text-red-600 text-sm">
                                                {error}
                                            </div>
                                        )}
                                        
                                        {manualSerialNumber && !isValid && (
                                            <div className="text-orange-600 text-sm">
                                                Серийный номер должен содержать 10-12 символов (буквы и цифры)
                                            </div>
                                        )}
                                        
                                        {isValid && (
                                            <div className="text-green-600 text-sm">
                                                ✓ Серийный номер корректен
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Кнопка подтверждения */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.3 }}
                        >
                            <Button
                                onClick={handleConfirm}
                                disabled={!isValid}
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Продолжить
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Page>
    );
}