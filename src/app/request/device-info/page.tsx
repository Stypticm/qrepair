'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';
import { WelcomeModal } from '@/components/ui/welcome-modal';
import { getPictureUrl } from '@/core/lib/assets';

export default function DeviceInfoPage() {
    const {
        telegramId,
        username,
        serialNumber,
        setSerialNumber,
        resetAllStates,
        setCurrentStep,
    } = useAppStore();
    const router = useRouter();

    const [manualSerialNumber, setManualSerialNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const addDebugInfo = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;
        console.log(debugMessage); // Simplified for production
    };

    useEffect(() => {
        setCurrentStep('device-info');
        addDebugInfo('Страница device-info загружена');
        addDebugInfo(`telegramId: ${telegramId || 'НЕТ'}`);
        addDebugInfo(`username: ${username || 'НЕТ'}`);
    }, [setCurrentStep, telegramId, username]);

    useEffect(() => {
        if (inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            if (inputRef.current && typeof window !== 'undefined' && window.innerWidth < 768) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 300);
            }
        };

        const handleResize = () => {
            if (inputRef.current && document.activeElement === inputRef.current && window.innerWidth < 768) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 100);
            }
        };

        const input = inputRef.current;
        if (input) {
            input.addEventListener('focus', handleFocus);
        }
        window.addEventListener('resize', handleResize);

        return () => {
            if (input) {
                input.removeEventListener('focus', handleFocus);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (serialNumber) {
            setManualSerialNumber(serialNumber);
            setIsValid(true);
        }
    }, [serialNumber]);

    useEffect(() => {
        const hasExistingData = serialNumber || (typeof window !== 'undefined' && sessionStorage.getItem('phoneSelection'));
        const hasSeenWelcome = typeof window !== 'undefined' && sessionStorage.getItem('hasSeenWelcome');

        if (!hasExistingData && !hasSeenWelcome) {
            setShowWelcomeModal(true);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('hasSeenWelcome', 'true');
            }
        }
    }, [serialNumber]);

    const steps = ['Серийный номер', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение'];

    const getCurrentStep = (): number => {
        return 1;
    };

    const validateSerialNumber = (sn: string): boolean => {
        if (sn.length < 10 || sn.length > 12) {
            return false;
        }
        if (!/^[A-Za-z0-9]+$/.test(sn)) {
            return false;
        }
        return true;
    };

    const handleInputChange = (value: string) => {
        setManualSerialNumber(value);
        setError('');
        setIsValid(value.length > 0);
    };

    const handleConfirm = async () => {
        addDebugInfo('Нажата кнопка "Продолжить"');
        if (!manualSerialNumber) {
            addDebugInfo('❌ Серийный номер не введен');
            setErrorMessage('Пожалуйста, введите серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (manualSerialNumber.length < 10 || manualSerialNumber.length > 12) {
            addDebugInfo(`❌ Серийный номер некорректной длины: ${manualSerialNumber.length} символов`);
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (!validateSerialNumber(manualSerialNumber)) {
            addDebugInfo('❌ Серийный номер не прошел валидацию');
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        addDebugInfo('✅ Серийный номер прошел валидацию');
        setShowDialog(true);
    };

    const handleContinue = async () => {
        setShowDialog(false);
        try {
            addDebugInfo('Начинаем сохранение данных');
            setSerialNumber(manualSerialNumber);
            const requestBody = {
                telegramId,
                username: username || 'Unknown',
                serialNumber: manualSerialNumber,
            };

            addDebugInfo('Отправляем запрос в API...');
            const response = await fetch('/api/request/device-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            addDebugInfo(`Ответ API: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                addDebugInfo(`❌ Ошибка API: ${errorText}`);
                throw new Error(`Ошибка сохранения данных: ${response.status} ${response.statusText}`);
            }

            addDebugInfo('✅ Данные успешно сохранены');
            addDebugInfo('Переходим на /request/form');
            router.push('/request/form');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addDebugInfo(`❌ Ошибка: ${errorMessage}`);
            setError(`Ошибка сохранения данных: ${errorMessage}. Попробуйте еще раз.`);
            setShowErrorDialog(true);
        }
    };

    const handleEdit = () => {
        setShowDialog(false);
    };

    return (
        <Page back={true}>
            <div className="w-full bg-gradient-to-b from-white to-gray-50 flex flex-col h-full pt-6">
                {/* ProgressBar */}
                <div className="pt-18 pb-2">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-2 pt-0 flex flex-col">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
                        {/* Instruction Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-2">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-full max-w-xs mx-auto mb-2">
                                            <Image
                                                src={getPictureUrl('animation.gif') || '/animation.gif'}
                                                alt="Инструкция по поиску серийного номера"
                                                width={300}
                                                height={120}
                                                className="w-full h-auto rounded-lg border border-blue-200"
                                            />
                                        </div>
                                        <div className="text-[10px] text-blue-800 space-y-1">
                                            <p><strong>Где найти:</strong> Настройки → Основные → Об этом устройстве</p>
                                            <p><strong>Что делать:</strong> Скопируйте серийный номер и вставьте в поле ниже</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Input Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <Card className="bg-white border-gray-200">
                                <CardContent className="p-2">
                                    <div className="space-y-1">
                                        <label className="block text-[11px] font-medium text-gray-700">
                                            Серийный номер
                                        </label>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={manualSerialNumber}
                                            onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                            placeholder="Введите серийный номер"
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-[11px]"
                                            maxLength={12}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Confirm Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.2 }}
                        >
                            <Button
                                onClick={handleConfirm}
                                disabled={!manualSerialNumber}
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                            >
                                Продолжить
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                onStart={() => setShowWelcomeModal(false)}
            />

            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    onClick={handleContinue}
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                        📱 Подтверждение серийного номера
                    </DialogTitle>
                    <div className="text-center">
                        <div className="bg-[#2dc2c6]/10 rounded-xl p-2 border border-[#2dc2c6] shadow-md mb-2">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium text-[16px]">Серийный номер:</span>
                                    <span className="font-semibold text-gray-900 text-right break-words text-[16px]">
                                        {manualSerialNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            👆 Нажмите на окно для перехода к следующему шагу
                        </p>
                        <p className="text-center text-sm text-gray-600 mt-1">
                            ✏️ Нажмите вне поля, если хотите отредактировать свой выбор
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent
                    className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-base font-semibold text-gray-900 mb-2">
                        ⚠️ Ошибка
                    </DialogTitle>
                    <div className="text-center">
                        <p className="text-[11px] text-gray-600 mb-2">
                            {errorMessage}
                        </p>
                        <Button
                            onClick={() => setShowErrorDialog(false)}
                            className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-1.5 rounded-lg transition-colors text-[11px]"
                        >
                            Понятно
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}