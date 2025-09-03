'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { useNavigation } from '@/components/NavigationContext/NavigationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { WelcomeModal } from '@/components/ui/welcome-modal';

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
    
    // Состояние для приветственного экрана
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);

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

    // Показываем приветственное модальное окно только для новых пользователей
    useEffect(() => {
        // Проверяем, есть ли сохраненные данные
        const hasExistingData = serialNumber || 
            (typeof window !== 'undefined' && sessionStorage.getItem('phoneSelection'));
        
        // Проверяем, не показывали ли уже приветствие в этой сессии
        const hasSeenWelcome = typeof window !== 'undefined' && 
            sessionStorage.getItem('hasSeenWelcome');
        
        // Если нет данных, но есть флаг приветствия - значит был сброс, показываем приветствие
        if (!hasExistingData) {
            if (!hasSeenWelcome) {
                // Показываем приветственный экран для новых пользователей
                setShowWelcomeModal(true);
                // Отмечаем, что пользователь уже видел приветствие
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('hasSeenWelcome', 'true');
                }
            } else {
                // Если был сброс данных, но флаг остался - показываем приветствие
                setShowWelcomeModal(true);
            }
        }
    }, [serialNumber]);

    // Шаги для прогресс-бара
    const steps = ['Серийный номер', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

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
        
        // Кнопка всегда активна, если есть хотя бы один символ
        setIsValid(value.length > 0);
    };

    // Обработчик подтверждения
    const handleConfirm = async () => {
        if (!manualSerialNumber) {
            setError('Пожалуйста, введите серийный номер');
            return;
        }

        // Проверяем длину
        if (manualSerialNumber.length < 10) {
            setError('Серийный номер должен содержать минимум 10 символов');
            return;
        }

        if (manualSerialNumber.length > 12) {
            setError('Серийный номер должен содержать максимум 12 символов');
            return;
        }

        // Проверяем валидность серийного номера
        if (!validateSerialNumber(manualSerialNumber)) {
            setError('Серийный номер должен содержать только буквы и цифры');
            return;
        }

        // Показываем диалоговое окно
        setShowDialog(true);
    };

    // Обработчики диалогового окна
    const handleContinue = async () => {
        setShowDialog(false);
        
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

    const handleEdit = () => {
        setShowDialog(false);
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

                <div className="flex-1 p-3 pt-1 flex flex-col overflow-y-auto">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-2">

                        {/* Инструкция */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-3">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">ℹ️</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Где найти серийный номер?</h4>
                                            <div className="text-sm text-blue-800 space-y-0.5">
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
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <Card className="bg-white border-gray-200">
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Серийный номер
                                            </label>
                                            <input
                                                type="text"
                                                value={manualSerialNumber}
                                                onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                                placeholder="Введите серийный номер"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-sm"
                                                maxLength={12}
                                            />
                                        </div>
                                        
                                        {error && (
                                            <div className="text-red-600 text-xs">
                                                {error}
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
                                disabled={!manualSerialNumber}
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Продолжить
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Приветственный экран */}
            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => {
                    setShowWelcomeModal(false);
                    // Крестика больше нет, поэтому эта функция не будет вызываться
                }}
                onStart={() => {
                    setShowWelcomeModal(false);
                    // Если пользователь нажал "Начать оценку", остаемся на странице
                }}
            />

            {/* Диалоговое окно с подтверждением */}
            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white border border-gray-200 cursor-pointer w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    onClick={handleContinue}
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-3">
                        📱 Подтверждение серийного номера
                    </DialogTitle>

                    <div className="text-center">
                        {/* Рамка для серийного номера */}
                        <div className="bg-[#2dc2c6]/10 rounded-2xl p-4 border border-[#2dc2c6] shadow-lg mb-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium text-sm">Серийный номер:</span>
                                    <span className="font-semibold text-gray-900 text-right break-words text-sm">
                                        {manualSerialNumber}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            👆 Нажмите на окно для перехода к следующему шагу
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">
                            ✏️ Нажмите вне поля, если хотите отредактировать серийный номер
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}