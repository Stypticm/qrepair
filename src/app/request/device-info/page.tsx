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
    const handleImeiInput = () => {
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

        // Переходим к следующему шагу - вводу S/N
        setSelectedMethod('sn_screenshot');
        setOcrError(null);
    };



    // Функция для плавного прогресса
    const animateProgress = (targetProgress: number, duration: number = 1000) => {
        return new Promise<void>((resolve) => {
            const startProgress = processingProgress;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentProgress = startProgress + (targetProgress - startProgress) * progress;
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
            await animateProgress(15, 500);

            setProcessingMessage('Отправка на сервер...');
            await animateProgress(25, 300);

            // Отправляем запрос на API
            setProcessingMessage('Обработка OCR...');
            await animateProgress(40, 200);
            
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
            await animateProgress(70, 300);

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
            await animateProgress(100, 500);

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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                📱 Получение IMEI и S/N
                            </h2>
                            <p className="text-sm text-gray-600">
                                Выберите способ получения данных устройства
                            </p>
                        </motion.div>

                        {/* Выбор метода ввода */}
                        {!selectedMethod && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                                className="space-y-3"
                            >
                                <Card className="p-3 border border-gray-200">
                                    <CardContent>
                                        <h4 className="font-semibold text-gray-800 mb-3">Получение данных устройства:</h4>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <h5 className="font-medium text-blue-800 mb-2">📱 Шаг 1: IMEI</h5>
                                                <p className="text-sm text-blue-700 mb-2">Быстро через код *#06#</p>
                                                <Button
                                                    onClick={() => setSelectedMethod('imei_dial')}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    ⌨️ Ввести IMEI
                                                </Button>
                                            </div>
                                            
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <h5 className="font-medium text-green-800 mb-2">📸 Шаг 2: S/N</h5>
                                                <p className="text-sm text-green-700 mb-2">Скриншот из настроек</p>
                                                <Button
                                                    onClick={() => setSelectedMethod('sn_screenshot')}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={!manualImei || manualImei.length !== 15}
                                                >
                                                    📸 Загрузить S/N
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Метод ввода IMEI */}
                        {selectedMethod === 'imei_dial' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                            >
                                <ImeiInputMethod
                                    manualImei={manualImei}
                                    setManualImei={setManualImei}
                                    onConfirm={handleImeiInput}
                                    onBack={() => setSelectedMethod(null)}
                                />
                            </motion.div>
                        )}

                        {/* Метод скриншота S/N */}
                        {selectedMethod === 'sn_screenshot' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                            >
                                <SnScreenshotMethod 
                                    snScreenshots={snScreenshots}
                                    onSnScreenshotUpload={handleSnScreenshotUpload}
                                    isProcessing={isProcessing}
                                    processingProgress={processingProgress}
                                    processingMessage={processingMessage}
                                    onBack={() => setSelectedMethod('imei_dial')}
                                    manualImei={manualImei}
                                />
                            </motion.div>
                        )}

                        

                        {/* Отображение ошибки OCR */}
                        {ocrError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
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
                                transition={{ duration: 0.3, ease: "easeOut" }}
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
                    className="bg-white w-[95vw] max-w-md mx-auto rounded-xl shadow-lg"
                    showCloseButton={true}
                >
                    <DialogTitle className="text-center text-xl font-semibold text-gray-900 mb-3">
                        Проверьте данные
                    </DialogTitle>

                    <div className="text-center">
                        {/* Рамка для выбранных данных */}
                        <div className="bg-[#2dc2c6]/10 rounded-2xl p-5 border border-[#2dc2c6] shadow-lg mb-4">
                            <div className="space-y-3">
                                {ocrResult?.imei && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">IMEI:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
                                            {ocrResult.imei}
                                        </span>
                                    </div>
                                )}
                                {ocrResult?.serialNumber && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">S/N:</span>
                                        <span className="font-semibold text-gray-900 text-right break-words">
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
                                className="w-full bg-[#2dc2c6] hover:bg-[#2dc2c6]/90 text-white"
                            >
                                ✅ Подтвердить и продолжить
                            </Button>

                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="w-full"
                            >
                                ✏️ Загрузить заново
                            </Button>
                        </div>

                        <p className="text-center text-xs text-gray-500 mt-3">
                            Проверьте правильность данных перед продолжением
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}

// Компонент для метода скриншота S/N
const SnScreenshotMethod = ({
    snScreenshots,
    onSnScreenshotUpload,
    isProcessing,
    processingProgress,
    processingMessage,
    onBack,
    manualImei
}: {
    snScreenshots: File[];
    onSnScreenshotUpload: (files: FileList | null) => void;
    isProcessing: boolean;
    processingProgress: number;
    processingMessage: string;
    onBack: () => void;
    manualImei: string;
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

            {/* Показываем введенный IMEI */}
            <Card className="p-3 bg-blue-50 border border-blue-200">
                <CardContent>
                    <div className="text-center">
                        <h4 className="font-semibold text-blue-800 mb-2">✅ IMEI введен</h4>
                        <p className="text-sm text-blue-700 font-mono bg-white p-2 rounded border">
                            {manualImei}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Инструкции для S/N */}
            <Card className="p-3 bg-green-50 border border-green-200">
                <CardContent>
                    <h4 className="font-semibold text-green-800 mb-2">
                        📸 Как получить S/N:
                    </h4>
                    <ol className="text-sm text-green-700 space-y-1">
                        <li>1. Откройте <strong>Настройки</strong></li>
                        <li>2. Перейдите в <strong>Основные → Об этом устройстве</strong></li>
                        <li>3. <strong>Прокрутите вниз</strong> до &quot;Серийный номер&quot;</li>
                        <li>4. Сделайте скриншот этой страницы</li>
                        <li>5. Загрузите скриншот ниже</li>
                    </ol>
                </CardContent>
            </Card>

            {/* Загрузка скриншота S/N */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Загрузите скриншот S/N</h4>
                    <p className="text-sm text-gray-600">
                        Загрузите скриншот страницы &quot;Об этом устройстве&quot; где виден серийный номер.
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onSnScreenshotUpload(e.target.files)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {snScreenshots.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Загружен скриншот S/N
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSnScreenshotUpload(null)}
                                disabled={isProcessing}
                                className="text-xs"
                            >
                                Очистить
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Прогресс-бар */}
            {isProcessing && (
                <Card className="p-3 bg-gray-50 border border-gray-200">
                    <CardContent className="text-center">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{processingMessage || 'Обрабатываем скриншоты...'}</span>
                                <span>{processingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#2dc2c6] h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${processingProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">Извлекаем S/N</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// Компонент для ввода IMEI
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
                ← Назад к выбору
            </Button>

            {/* Инструкции */}
            <Card className="p-3 bg-blue-50 border border-blue-200">
                <CardContent>
                    <h4 className="font-semibold text-blue-800 mb-2">
                        ⌨️ Как получить IMEI:
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Откройте приложение <strong>&quot;Телефон&quot;</strong></li>
                        <li>2. Наберите код: <strong className="text-lg bg-white px-2 py-1 rounded border">*#06#</strong></li>
                        <li>3. На экране появится <strong>IMEI (15 цифр)</strong></li>
                        <li>4. <strong>Запомните или запишите</strong> IMEI</li>
                        <li>5. Введите IMEI в поле ниже</li>
                    </ol>
                    
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                            <strong>💡 Совет:</strong> Если не получается скопировать, просто запомните или запишите IMEI на бумаге, затем введите вручную.
                        </p>
                    </div>
                    
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-800">
                            <strong>🔄 Альтернатива:</strong> Также можно найти IMEI в <strong>Настройки → Основные → Об этом устройстве</strong>
                        </p>
                    </div>
                    
                    {/* Кнопка для открытия приложения Телефон */}
                    <div className="mt-3 p-2 bg-white rounded border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Открыть приложение:</span>
                            <Button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        // Пытаемся открыть приложение Телефон
                                        const phoneUrl = 'tel:*#06#';
                                        window.open(phoneUrl, '_blank');
                                        
                                        if ((window as any).Telegram?.WebApp) {
                                            (window as any).Telegram.WebApp.showAlert('Открываю приложение Телефон. Наберите *#06# в появившемся окне.');
                                        }
                                    }
                                }}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                            >
                                📞 Открыть Телефон
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Поле ввода IMEI */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            IMEI (15 цифр):
                        </label>
                        <input
                            type="text"
                            value={manualImei}
                            onChange={(e) => setManualImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                            placeholder="Введите IMEI вручную"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Введите IMEI вручную (15 цифр)
                        </p>
                    </div>

                    <Button
                        onClick={onConfirm}
                        disabled={!manualImei || manualImei.length !== 15}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ✅ Подтвердить IMEI
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};


