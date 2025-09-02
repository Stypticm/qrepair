'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';

type InputMethod = 'screenshot' | null;

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

    // Состояние для скриншотов
    const [screenshots, setScreenshots] = useState<File[]>([]);

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



    // Функция для обработки скриншотов (упрощенная)
    const handleScreenshotUpload = (files: FileList | null) => {
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setScreenshots(fileArray);
        }
    };



    // Функция для обработки OCR
    const processOCR = async () => {
        setIsProcessing(true);
        setProcessingProgress(0);
        setProcessingMessage('Подготовка изображений...');
        setOcrError(null);

        try {
            const formData = new FormData();

            // Добавляем изображения
            if (screenshots.length >= 2) {
                formData.append('snImage', screenshots[0]);
                formData.append('imeiImage', screenshots[1]);
            } else if (screenshots.length === 1) {
                // Если только один файл, используем его для обоих
                formData.append('snImage', screenshots[0]);
                formData.append('imeiImage', screenshots[0]);
            }

            // Добавляем дополнительные данные
            formData.append('telegramId', telegramId || '');
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                formData.append('initData', (window as any).Telegram.WebApp.initData);
            }

            // Быстрый прогресс загрузки
            setProcessingProgress(10);
            setProcessingMessage('Загрузка изображений...');

            setProcessingProgress(25);
            setProcessingMessage('Отправка на сервер...');

                        // Отправляем запрос на API
            setProcessingProgress(40);
            setProcessingMessage('Обработка OCR...');
            
            // Добавляем таймаут для запроса (60 секунд)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            
            const response = await fetch('/api/ocr/process-device-photos', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            setProcessingProgress(70);
            setProcessingMessage('Извлечение данных...');

            if (!response.ok) {
                throw new Error('OCR processing failed');
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Проверяем, удалось ли извлечь данные
            if (!result.imei || !result.serialNumber) {
                throw new Error('Не удалось извлечь IMEI или S/N из изображений. Попробуйте сделать фото заново с лучшим качеством.');
            }

            setOcrResult(result);
            setImei(result.imei);
            setSerialNumber(result.serialNumber);

            // Сохраняем в sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('imei', result.imei);
                sessionStorage.setItem('serialNumber', result.serialNumber);
            }

            setProcessingProgress(100);
            setProcessingMessage('Готово!');

            // Отправляем сообщение в Telegram
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                const webApp = (window as any).Telegram.WebApp;
                webApp.showAlert('✅ IMEI и S/N загружены и всё!');
            }

            // Показываем диалог подтверждения
            setShowDialog(true);

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                setOcrError('Время обработки истекло. Попробуйте еще раз с изображениями меньшего размера.');
            } else {
                setOcrError(error instanceof Error ? error.message : 'Ошибка обработки изображений');
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
                return;
            }

            const savedImei = sessionStorage.getItem('imei');
            const savedSerialNumber = sessionStorage.getItem('serialNumber');

            if (savedImei) {
                setImei(savedImei);

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
            }
        }
    }, [setImei, setSerialNumber, resetAllStates]);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        loadSavedData();
    }, [loadSavedData]);

    // Проверяем, готовы ли данные для обработки OCR
    const isReadyForOCR = useCallback(() => {
        return screenshots.length >= 1; // Достаточно хотя бы одного файла
    }, [screenshots]);

    // Автоматически запускаем OCR когда готовы данные
    useEffect(() => {
        if (isReadyForOCR() && !isProcessing && !ocrResult) {
            processOCR();
        }
    }, [isReadyForOCR, isProcessing, ocrResult]);

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
        setSelectedMethod(null);
        setScreenshots([]);
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
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                📱 Получение IMEI и S/N
                            </h2>
                            <p className="text-sm text-gray-600">
                                Выберите способ получения данных устройства
                            </p>
                        </motion.div>

                        {/* Загрузка скриншотов */}
                        {!selectedMethod && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <ScreenshotMethod 
                                    screenshots={screenshots}
                                    onScreenshotUpload={handleScreenshotUpload}
                                    isProcessing={isProcessing}
                                    processingProgress={processingProgress}
                                    processingMessage={processingMessage}
                                />
                            </motion.div>
                        )}

                        

                        {/* Отображение ошибки OCR */}
                        {ocrError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                                    setScreenshots([]);
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
                                        setScreenshots([]);
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

// Компонент для метода скриншота
const ScreenshotMethod = ({
    screenshots,
    onScreenshotUpload,
    isProcessing,
    processingProgress,
    processingMessage
}: {
    screenshots: File[];
    onScreenshotUpload: (files: FileList | null) => void;
    isProcessing: boolean;
    processingProgress: number;
    processingMessage: string;
}) => {
    return (
        <div className="space-y-3">
            {/* Инструкции */}
            <Card className="p-3 bg-blue-50 border border-blue-200">
                <CardContent>
                    <h4 className="font-semibold text-blue-800 mb-2">
                        📸 Как сделать скриншот:
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Откройте Настройки → Основные → Об этом устройстве</li>
                        <li>2. Нажмите одновременно: <strong>Кнопка питания + Кнопка увеличения громкости</strong></li>
                        <li>3. Экран мигнет - скриншот готов!</li>
                        <li>4. Нажмите на превью скриншота</li>
                        <li>5. Выберите &quot;Полный экран&quot;</li>
                    </ol>
                </CardContent>
            </Card>

            {/* Загрузка скриншотов */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Загрузите скриншоты</h4>
                    <p className="text-sm text-gray-600">
                        Загрузите 1-2 скриншота с информацией об устройстве. Мы сами определим, где S/N, а где IMEI.
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onScreenshotUpload(e.target.files)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {screenshots.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Загружено скриншотов: {screenshots.length}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onScreenshotUpload(null)}
                                disabled={isProcessing}
                                className="text-xs"
                            >
                                Очистить все
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
                            <p className="text-xs text-gray-500">Извлекаем IMEI и S/N</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};


