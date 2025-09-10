'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react'
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
        setCurrentStep
    } = useAppStore();
    const router = useRouter();

    // Состояние для ручного ввода S/N
    const [manualSerialNumber, setManualSerialNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    
    // Ref для автофокуса
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Состояние для приветственного экрана
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);
    
    // Состояние диалогового окна с ошибкой
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Состояние для отладочной информации
    const [debugInfo, setDebugInfo] = useState<string[]>([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);

    // Функция для добавления отладочной информации
    const addDebugInfo = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;
        setDebugInfo(prev => [...prev.slice(-9), debugMessage]); // Показываем последние 10 сообщений
    };

    // Устанавливаем текущий шаг при загрузке страницы
    useEffect(() => {
        setCurrentStep('device-info');
        addDebugInfo('Страница device-info загружена');
        addDebugInfo(`telegramId: ${telegramId || 'НЕТ'}`);
        addDebugInfo(`username: ${username || 'НЕТ'}`);
    }, [setCurrentStep]);

    // Автофокус на поле ввода
    useEffect(() => {
        if (inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    // Обработчик для прокрутки к полю ввода при появлении клавиатуры
    useEffect(() => {
        const handleFocus = () => {
            if (inputRef.current) {
                // Небольшая задержка для появления клавиатуры
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            }
        };

        const handleBlur = () => {
            // Прокрутка вверх при скрытии клавиатуры
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        };

        // Обработчик изменения размера окна (для мобильных устройств)
        const handleResize = () => {
            if (inputRef.current && document.activeElement === inputRef.current) {
                // Если поле в фокусе и изменился размер окна (клавиатура появилась/скрылась)
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 100);
            }
        };

        const input = inputRef.current;
        if (input) {
            input.addEventListener('focus', handleFocus);
            input.addEventListener('blur', handleBlur);
        }

        // Добавляем обработчик изменения размера окна
        window.addEventListener('resize', handleResize);

        return () => {
            if (input) {
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('blur', handleBlur);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
        addDebugInfo('Нажата кнопка "Продолжить"');
        
        if (!manualSerialNumber) {
            addDebugInfo('❌ Серийный номер не введен');
            setErrorMessage('Пожалуйста, введите серийный номер');
            setShowErrorDialog(true);
            return;
        }

        addDebugInfo(`Проверяем серийный номер: ${manualSerialNumber}`);

        // Проверяем длину
        if (manualSerialNumber.length < 10) {
            addDebugInfo(`❌ Серийный номер слишком короткий: ${manualSerialNumber.length} символов`);
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (manualSerialNumber.length > 12) {
            addDebugInfo(`❌ Серийный номер слишком длинный: ${manualSerialNumber.length} символов`);
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        // Проверяем валидность серийного номера
        if (!validateSerialNumber(manualSerialNumber)) {
            addDebugInfo('❌ Серийный номер не прошел валидацию');
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        addDebugInfo('✅ Серийный номер прошел валидацию');
        // Показываем диалоговое окно
        setShowDialog(true);
    };

    // Обработчики диалогового окна
    const handleContinue = async () => {
        setShowDialog(false);
        
        try {
            addDebugInfo('Начинаем сохранение данных');
            addDebugInfo(`telegramId: ${telegramId || 'НЕТ'}`);
            addDebugInfo(`username: ${username || 'НЕТ'}`);
            addDebugInfo(`serialNumber: ${manualSerialNumber}`);
            
            // Сохраняем в контекст
            setSerialNumber(manualSerialNumber);

            // Сохраняем в БД
            const requestBody = {
                telegramId,
                username: username || 'Unknown',
                serialNumber: manualSerialNumber,
            };
            
            addDebugInfo('Отправляем запрос в API...');
            
            const response = await fetch('/api/request/device-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            addDebugInfo(`Ответ API: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                addDebugInfo(`❌ Ошибка API: ${errorText}`);
                throw new Error(`Ошибка сохранения данных: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            addDebugInfo('✅ Данные успешно сохранены');

            // Переходим на следующую страницу
            addDebugInfo('Переходим на /request/form');
            router.push('/request/form');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addDebugInfo(`❌ Ошибка: ${errorMessage}`);
            setError(`Ошибка сохранения данных: ${errorMessage}. Попробуйте еще раз.`);
        }
    };

    const handleEdit = () => {
        setShowDialog(false);
    };

    return (
        <Page back={true}>
            <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-y-auto">
                {/* Прогресс-бар */}
                <div className="pt-6 pb-0">
                    <ProgressBar
                        currentStep={getCurrentStep()}
                        totalSteps={5}
                        steps={steps}
                    />
                </div>

                <div className="flex-1 p-3 pt-1 flex flex-col overflow-y-auto">
                    <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-2">

                        {/* Инструкция с анимацией */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-3">
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="text-center">
                                            <div className="w-full max-w-xs mx-auto mb-3">
                                                <Image 
                                                    src={getPictureUrl('animation.gif') || '/animation.gif'}
                                                    alt="Инструкция по поиску серийного номера"
                                                    width={300}
                                                    height={200}
                                                    className="w-full h-auto rounded-lg border border-blue-200"
                                                />
                                            </div>
                                            <div className="text-xs text-blue-800 space-y-1">
                                                <p><strong>Где найти:</strong> Настройки → Основные → Об этом устройстве</p>
                                                <p><strong>Что делать:</strong> Скопируйте серийный номер и вставьте в поле ниже</p>
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
                                                ref={inputRef}
                                                type="text"
                                                value={manualSerialNumber}
                                                onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                                placeholder="Введите серийный номер"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors text-sm scroll-to-input"
                                                maxLength={12}
                                                style={{ scrollMarginTop: '100px' }}
                                            />
                                        </div>
                                        

                                        

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

                        {/* Кнопка отладки */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.4 }}
                        >
                            <Button
                                onClick={() => setShowDebugPanel(!showDebugPanel)}
                                variant="outline"
                                className="w-full text-xs text-gray-600 border-gray-300"
                            >
                                {showDebugPanel ? 'Скрыть отладку' : 'Показать отладку'}
                            </Button>
                        </motion.div>

                        {/* Панель отладки */}
                        {showDebugPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                                className="mt-2"
                            >
                                <Card className="bg-gray-100 border-gray-300">
                                    <CardContent className="p-3">
                                        <div className="text-xs font-semibold text-gray-700 mb-2">
                                            🔍 Отладочная информация:
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {debugInfo.length === 0 ? (
                                                <div className="text-gray-500 text-xs">Нет отладочной информации</div>
                                            ) : (
                                                debugInfo.map((info, index) => (
                                                    <div key={index} className="text-xs text-gray-600 font-mono">
                                                        {info}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            telegramId: {telegramId || 'НЕТ'} | username: {username || 'НЕТ'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
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

            {/* Диалоговое окно с ошибкой */}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent
                    className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-3">
                        ⚠️ Ошибка
                    </DialogTitle>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            {errorMessage}
                        </p>

                        <Button
                            onClick={() => setShowErrorDialog(false)}
                            className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            Понятно
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}