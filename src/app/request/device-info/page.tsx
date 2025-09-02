'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';


type InputMethod = 'imei_dial' | 'sn_screenshot' | null;

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

    // Состояние выбора способа ввода
    const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);

    // Состояние для скриншотов S/N
    const [snScreenshots, setSnScreenshots] = useState<File[]>([]);

    // Состояние для ручного ввода IMEI
    const [manualImei, setManualImei] = useState('');
    
    // Состояние для ручного ввода S/N
    const [manualSerialNumber, setManualSerialNumber] = useState('');

    // Состояние обработки OCR
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingMessage, setProcessingMessage] = useState('');

    // Состояние результата OCR
    const [ocrResult, setOcrResult] = useState<{
        imei: string;
        serialNumber: string;
        confidence: number;
    } | null>(null);

    // Состояние ошибки OCR
    const [ocrError, setOcrError] = useState<string | null>(null);

    // Состояние диалогового окна
    const [showDialog, setShowDialog] = useState(false);

    // Шаги для прогресс-бара
    const steps = ['Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'IMEI и S/N', 'Подтверждение'];

    // Определяем текущий шаг для прогресс-бара
    const getCurrentStep = (): number => {
        return 4;
    };

    // Проверяем, доступен ли Telegram WebApp API
    const isTelegramWebApp = typeof window !== 'undefined' &&
        (window as any).Telegram?.WebApp &&
        ((window as any).Telegram.WebApp.openCamera || (window as any).Telegram.WebApp.openPhotoGallery);

    // Функция для валидации IMEI (алгоритм Луна)
    const validateIMEI = (imei: string): boolean => {
        if (!imei || imei.length !== 15 || !/^\d+$/.test(imei)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 14; i++) {
            let digit = parseInt(imei[i]);
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) {
                    digit = Math.floor(digit / 10) + (digit % 10);
                }
            }
            sum += digit;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(imei[14]);
    };

    // Функция для валидации серийного номера
    const validateSerialNumber = (sn: string): boolean => {
        return Boolean(sn && sn.length >= 10 && sn.length <= 12 && /^[A-Z0-9]+$/i.test(sn));
    };



    // Функция для обработки скриншотов S/N
    const handleSnScreenshotUpload = (files: FileList | null) => {
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setSnScreenshots(fileArray);
        }
    };

    // Функция для обработки ручного ввода IMEI
    const handleImeiInput = async () => {
        const isValidImei = validateIMEI(manualImei);

        if (!isValidImei) {
            setOcrError('Проверьте правильность введенного IMEI. Должно быть 15 цифр.');
            return;
        }

        // Сохраняем IMEI
        setImei(manualImei);
        
        // Сохраняем в sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('imei', manualImei);
        }

        // Сохраняем в БД
        try {
            await fetch('/api/request/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    username: 'Unknown',
                    imei: manualImei,
                    currentStep: 'device-info',
                }),
            });
        } catch (error) {
            console.error('Ошибка сохранения IMEI в БД:', error);
        }

        // Переходим к следующему шагу
        setSelectedMethod('sn_screenshot');
        setOcrError(null);
    };

    // Функция для обработки ручного ввода S/N
    const handleSnInput = async () => {
        const isValidSn = validateSerialNumber(manualSerialNumber);

        if (!isValidSn) {
            setOcrError('Проверьте правильность введенного S/N. Должно быть 10-12 символов.');
            return;
        }

        // Сохраняем S/N
        setSerialNumber(manualSerialNumber);
        
        // Сохраняем в sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('serialNumber', manualSerialNumber);
        }

        // Сохраняем в БД
        try {
            await fetch('/api/request/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    username: 'Unknown',
                    sn: manualSerialNumber,
                    currentStep: 'device-info',
                }),
            });
        } catch (error) {
            console.error('Ошибка сохранения S/N в БД:', error);
        }

        // Показываем диалог с результатами
        setShowDialog(true);
        setOcrError(null);
    };



    // Функция для плавного прогресса (оптимизированная)
    const animateProgress = (targetProgress: number, duration: number = 500) => {
        return new Promise<void>((resolve) => {
            const startProgress = processingProgress;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Используем easeOut для более естественного движения
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress;
                setProcessingProgress(Math.round(currentProgress));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    };

    // Функция для обработки OCR S/N
    const processSnOCR = async () => {
        setIsProcessing(true);
        setProcessingProgress(0);
        setProcessingMessage('Подготовка изображения...');
        setOcrError(null);

        try {
            const formData = new FormData();

            // Добавляем изображение S/N
            if (snScreenshots.length > 0) {
                formData.append('snImage', snScreenshots[0]);
                // Для IMEI используем уже введенный вручную
                formData.append('imeiImage', snScreenshots[0]); // Дублируем для API
            }

            // Добавляем дополнительные данные
            formData.append('telegramId', telegramId || '');
            formData.append('manualImei', manualImei); // Передаем уже введенный IMEI
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                formData.append('initData', (window as any).Telegram.WebApp.initData);
            }

            // Плавный прогресс загрузки
            setProcessingMessage('Загрузка изображения...');
            await animateProgress(15, 300);

            setProcessingMessage('Отправка на сервер...');
            await animateProgress(25, 200);

            // Отправляем запрос на API
            setProcessingMessage('Обработка OCR...');
            await animateProgress(40, 150);
            
            // Добавляем таймаут для запроса (45 секунд)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);
            
            const response = await fetch('/api/ocr/process-device-photos', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            setProcessingMessage('Извлечение S/N...');
            await animateProgress(70, 200);

            if (!response.ok) {
                throw new Error('OCR processing failed');
            }

            const result = await response.json();

            if (result.error) {
                const errorMsg = result.details ? `${result.error}: ${result.details}` : result.error;
                const suggestion = result.suggestion ? `\n\n${result.suggestion}` : '';
                throw new Error(errorMsg + suggestion);
            }

            // Проверяем, удалось ли извлечь S/N
            if (!result.serialNumber) {
                throw new Error('Не удалось извлечь S/N из изображения. Попробуйте сделать фото заново с лучшим качеством.');
            }

            // Используем введенный вручную IMEI и извлеченный S/N
            const finalResult = {
                imei: manualImei,
                serialNumber: result.serialNumber,
                confidence: result.confidence || 100
            };

            setOcrResult(finalResult);
            setSerialNumber(result.serialNumber);

            // Сохраняем в sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('serialNumber', result.serialNumber);
            }

            setProcessingMessage('Готово!');
            await animateProgress(100, 300);

            // Отправляем сообщение в Telegram
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                const webApp = (window as any).Telegram.WebApp;
                webApp.showAlert('✅ IMEI и S/N загружены и всё!');
            }

            // Показываем диалог подтверждения
            setShowDialog(true);

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                setOcrError('Время обработки истекло (45 сек). Попробуйте еще раз с изображением меньшего размера или лучшего качества.');
            } else if (error instanceof Error && error.message.includes('OCR timeout')) {
                setOcrError('OCR обработка заняла слишком много времени. Попробуйте изображение с более четким текстом.');
            } else {
                setOcrError(error instanceof Error ? error.message : 'Ошибка обработки изображения. Проверьте качество фото.');
            }
        } finally {
            setIsProcessing(false);
            setProcessingProgress(0);
            setProcessingMessage('');
        }
    };

    // Загрузка сохраненных данных из sessionStorage
    const loadSavedData = useCallback(async () => {
        if (typeof window !== 'undefined') {
            // Проверяем, есть ли данные о выборе модели (новая заявка)
            const phoneSelection = sessionStorage.getItem('phoneSelection');

            if (!phoneSelection) {
                // Новая заявка - очищаем старые данные
                resetAllStates();
                setSelectedMethod(null); // Сбрасываем выбор метода
                setSnScreenshots([]); // Очищаем скриншоты S/N
                setManualImei(''); // Очищаем ручной ввод IMEI
                setManualSerialNumber(''); // Очищаем ручной ввод S/N
                return;
            }

            const savedImei = sessionStorage.getItem('imei');
            const savedSerialNumber = sessionStorage.getItem('serialNumber');

            if (savedImei) {
                setImei(savedImei);
                setManualImei(savedImei);
            }

            if (savedSerialNumber) {
                setSerialNumber(savedSerialNumber);
                setManualSerialNumber(savedSerialNumber);
            }

            // Если есть сохраненные данные, показываем диалог подтверждения
            if (savedImei && savedSerialNumber) {
                setOcrResult({
                    imei: savedImei,
                    serialNumber: savedSerialNumber,
                    confidence: 100
                });
                setShowDialog(true);
            } else if (savedImei && !savedSerialNumber) {
                // Если есть IMEI, но нет S/N - переходим к вводу S/N
                setSelectedMethod('sn_screenshot');
            } else {
                // Если нет сохраненных данных, показываем выбор метода
                setSelectedMethod(null);
            }
        }
    }, [setImei, setSerialNumber, resetAllStates]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        loadSavedData();
    }, [loadSavedData]);

    // Проверяем, готовы ли данные для обработки OCR S/N
    const isReadyForSnOCR = useCallback(() => {
        return snScreenshots.length >= 1 && manualImei.length === 15; // Есть скриншот и IMEI
    }, [snScreenshots, manualImei]);

    // Автоматически запускаем OCR когда готовы данные
    useEffect(() => {
        if (isReadyForSnOCR() && !isProcessing && !ocrResult && selectedMethod === 'sn_screenshot') {
            processSnOCR();
        }
    }, [isReadyForSnOCR, isProcessing, ocrResult, selectedMethod]);

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
        // Сбрасываем все состояния для повторного ввода
        setSelectedMethod('imei_dial'); // Начинаем с ввода IMEI
        setSnScreenshots([]);
        setManualImei('');
        setManualSerialNumber('');
        setOcrResult(null);
        setOcrError(null);
        setImei('');
        setSerialNumber('');

        // Убираем backdrop (серый фон) при редактировании
        setTimeout(() => {
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay], .fixed.inset-0');
            backdrops.forEach(backdrop => {
                if (backdrop instanceof HTMLElement) {
                    backdrop.style.display = 'none';
                }
            });
        }, 50);

        // Очищаем sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('imei');
            sessionStorage.removeItem('serialNumber');
        }
    };

    // Функция для сброса при нажатии "Назад"
    const handleBack = () => {
        if (selectedMethod === 'sn_screenshot') {
            // Если мы на этапе S/N, возвращаемся к IMEI
            setSelectedMethod('imei_dial');
            setSnScreenshots([]);
            setOcrError(null);
        } else {
            // Если мы на этапе IMEI, возвращаемся к выбору
            setSelectedMethod(null);
            setManualImei('');
            setManualSerialNumber('');
            setOcrError(null);
            router.back();
        }
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
                    <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-4">

                        {/* Заголовок */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                IMEI и S/N
                            </h2>
                            <p className="text-sm text-gray-500">
                                Получите данные устройства
                            </p>
                        </motion.div>

                        {/* Выбор метода ввода */}
                        {!selectedMethod && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="space-y-3"
                            >
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-4">
                                            <h4 className="text-base font-semibold text-gray-900 mb-3">Выберите способ</h4>
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => setSelectedMethod('imei_dial')}
                                                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm">⌨️</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <h5 className="font-medium text-gray-900 text-sm">IMEI</h5>
                                                            <p className="text-xs text-gray-500">Через код *#06#</p>
                                                        </div>
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    onClick={() => setSelectedMethod('sn_screenshot')}
                                                    disabled={!manualImei || manualImei.length !== 15}
                                                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm">📸</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <h5 className="font-medium text-gray-900 text-sm">S/N</h5>
                                                            <p className="text-xs text-gray-500">Скриншот настроек</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}



                        {/* Метод ввода IMEI */}
                        {selectedMethod === 'imei_dial' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <ImeiInputMethod 
                                    manualImei={manualImei}
                                    setManualImei={setManualImei}
                                    onConfirm={handleImeiInput}
                                    onBack={() => setSelectedMethod(null)}
                                />
                            </motion.div>
                        )}

                        {/* Метод ввода S/N */}
                        {selectedMethod === 'sn_screenshot' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <SnInputMethod 
                                    manualSerialNumber={manualSerialNumber}
                                    setManualSerialNumber={setManualSerialNumber}
                                    onConfirm={handleSnInput}
                                    onBack={() => setSelectedMethod('imei_dial')}
                                />
                            </motion.div>
                        )}

                        

                        {/* Отображение ошибки OCR */}
                        {ocrError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="p-4 bg-red-50 border border-red-200">
                                    <CardContent>
                                        <div className="text-center space-y-3">
                                            <div className="text-red-600">
                                                <span className="text-2xl">⚠️</span>
                                            </div>
                                            <p className="text-sm text-red-700">{ocrError}</p>
                                            <Button
                                                onClick={() => {
                                                    setOcrError(null);
                                                    setSnScreenshots([]);
                                                }}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Попробовать еще раз
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}



                        {/* Кнопка повторной обработки после успешного OCR */}
                        {ocrResult && !isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOcrResult(null);
                                        setSnScreenshots([]);
                                    }}
                                    className="w-full"
                                >
                                    🔄 Обработать заново
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>



            {/* Диалоговое окно с итоговой информацией */}
            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className="bg-white w-[90vw] max-w-sm mx-auto rounded-2xl shadow-2xl border-0 max-h-[80vh] overflow-y-auto"
                    showCloseButton={true}
                >
                    <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-4">
                        ✅ Данные готовы
                    </DialogTitle>

                    <div className="text-center space-y-4">
                        {/* Рамка для выбранных данных */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="space-y-3">
                                {ocrResult?.imei && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 font-medium">IMEI:</span>
                                        <span className="font-mono font-semibold text-gray-900 text-right break-words text-sm bg-white px-2 py-1 rounded-md border">
                                            {ocrResult.imei}
                                        </span>
                                    </div>
                                )}
                                {ocrResult?.serialNumber && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 font-medium">S/N:</span>
                                        <span className="font-mono font-semibold text-gray-900 text-right break-words text-sm bg-white px-2 py-1 rounded-md border">
                                            {ocrResult.serialNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleContinue}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                Продолжить
                            </Button>

                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="w-full py-3 text-sm font-medium rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Изменить
                            </Button>
                        </div>

                        <p className="text-center text-xs text-gray-500">
                            Проверьте правильность данных перед продолжением
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}

// Компонент для метода ввода IMEI
const ImeiInputMethod = ({
    manualImei,
    setManualImei,
    onConfirm,
    onBack
}: {
    manualImei: string;
    setManualImei: (value: string) => void;
    onConfirm: () => void;
    onBack: () => void;
}) => {
    return (
        <div className="space-y-3">
            {/* Кнопка назад */}
            <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="w-full"
            >
                ← Назад
            </Button>

            {/* Инструкции для IMEI */}
            <Card className="p-3 bg-gray-50 border border-gray-200">
                <CardContent>
                    <h4 className="font-medium text-gray-800 mb-2 text-sm">
                        📱 Как получить IMEI
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                            <span>Настройки → Основные → Об этом устройстве</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                            <span>Найдите IMEI и скопируйте</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                            <span>Вставьте в поле ниже и нажмите &quot;Ввод&quot;</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Кнопка для iPhone */}
            <button
                onClick={() => {
                    if ((window as any).Telegram?.WebApp) {
                        (window as any).Telegram.WebApp.showAlert('Для получения IMEI:\n\n1. Откройте Настройки на iPhone\n2. Перейдите в Основные → Об этом устройстве\n3. Найдите IMEI и нажмите на него\n4. Выберите "Копировать"\n5. Вернитесь в приложение и вставьте IMEI');
                    }
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors duration-200 text-xs border border-gray-300"
            >
                📱 Инструкции для iPhone
            </button>

            {/* Поле ввода IMEI */}
            <Card className="p-3 border border-gray-200">
                <CardContent>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">
                            IMEI
                        </label>
                        <input
                            type="text"
                            value={manualImei}
                            onChange={(e) => setManualImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                            placeholder="Введите IMEI"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center text-sm font-mono bg-white"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && manualImei.length === 15) {
                                    onConfirm();
                                }
                            }}
                        />
                        <p className="text-xs text-gray-400 text-center">
                            15 цифр
                        </p>
                        {manualImei.length === 15 && (
                            <p className="text-xs text-green-600 text-center font-medium">
                                ✅ Готово! Нажмите &quot;Подтвердить&quot; или клавишу &quot;Ввод&quot; на клавиатуре
                            </p>
                        )}
                        {manualImei.length > 0 && manualImei.length < 15 && (
                            <p className="text-xs text-orange-600 text-center font-medium">
                                ⚠️ Введите еще {15 - manualImei.length} цифр
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Кнопка подтверждения */}
            <Button
                onClick={onConfirm}
                disabled={!manualImei || manualImei.length !== 15}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 text-sm"
            >
                Подтвердить
            </Button>
        </div>
    );
};

// Компонент для метода ввода S/N
const SnInputMethod = ({
    manualSerialNumber,
    setManualSerialNumber,
    onConfirm,
    onBack
}: {
    manualSerialNumber: string;
    setManualSerialNumber: (value: string) => void;
    onConfirm: () => void;
    onBack: () => void;
}) => {
    return (
        <div className="space-y-3">
            {/* Кнопка назад */}
            <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="w-full"
            >
                ← Назад к IMEI
            </Button>

            {/* Инструкции для S/N */}
            <Card className="p-3 bg-gray-50 border border-gray-200">
                <CardContent>
                    <h4 className="font-medium text-gray-800 mb-2 text-sm">
                        📱 Как получить S/N
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                            <span>Настройки → Основные → Об этом устройстве</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                            <span>Найдите S/N и скопируйте</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                            <span>Вставьте в поле ниже и нажмите &quot;Ввод&quot;</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Кнопка для iPhone */}
            <button
                onClick={() => {
                    if ((window as any).Telegram?.WebApp) {
                        (window as any).Telegram.WebApp.showAlert('Для получения S/N:\n\n1. Откройте Настройки на iPhone\n2. Перейдите в Основные → Об этом устройстве\n3. Найдите "Серийный номер" и нажмите на него\n4. Выберите "Копировать"\n5. Вернитесь в приложение и вставьте S/N');
                    }
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors duration-200 text-xs border border-gray-300"
            >
                📱 Инструкции для iPhone
            </button>

            {/* Поле ввода S/N */}
            <Card className="p-3 border border-gray-200">
                <CardContent>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">
                            S/N
                        </label>
                        <input
                            type="text"
                            value={manualSerialNumber}
                            onChange={(e) => setManualSerialNumber(e.target.value.toUpperCase().slice(0, 12))}
                            placeholder="Введите S/N"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-center text-sm font-mono bg-white"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && manualSerialNumber.length >= 10) {
                                    onConfirm();
                                }
                            }}
                        />
                        <p className="text-xs text-gray-400 text-center">
                            10-12 символов
                        </p>
                        {manualSerialNumber.length >= 10 && (
                            <p className="text-xs text-green-600 text-center font-medium">
                                ✅ Готово! Нажмите &quot;Подтвердить&quot; или клавишу &quot;Ввод&quot; на клавиатуре
                            </p>
                        )}
                        {manualSerialNumber.length > 0 && manualSerialNumber.length < 10 && (
                            <p className="text-xs text-orange-600 text-center font-medium">
                                ⚠️ Введите еще {10 - manualSerialNumber.length} символов
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Кнопка подтверждения */}
            <Button
                onClick={onConfirm}
                disabled={!manualSerialNumber || manualSerialNumber.length < 10}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 text-sm"
            >
                Подтвердить
            </Button>
        </div>
    );
};




