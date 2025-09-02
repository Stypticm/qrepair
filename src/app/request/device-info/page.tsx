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

type InputMethod = 'screenshot' | 'photo' | null;

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
    const [screenshots, setScreenshots] = useState<{
        snScreenshot: File | null;
        imeiScreenshot: File | null;
    }>({ snScreenshot: null, imeiScreenshot: null });
    
    // Состояние для фото
    const [photos, setPhotos] = useState<{
        snPhoto: Blob | null;
        imeiPhoto: Blob | null;
    }>({ snPhoto: null, imeiPhoto: null });
    
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
        (window as any).Telegram.WebApp.openCamera;
    
    // Отладочная информация
    if (typeof window !== 'undefined') {
        console.log('Telegram WebApp доступен:', !!(window as any).Telegram?.WebApp);
        console.log('openCamera доступен:', !!(window as any).Telegram?.WebApp?.openCamera);
        console.log('isTelegramWebApp:', isTelegramWebApp);
    }

    // Функция для обработки скриншотов
    const handleScreenshotUpload = (type: 'sn' | 'imei', file: File | null) => {
        if (type === 'sn') {
            setScreenshots(prev => ({ ...prev, snScreenshot: file }));
        } else {
            setScreenshots(prev => ({ ...prev, imeiScreenshot: file }));
        }
    };

    // Функция для обработки фото через Telegram WebApp
    const handlePhotoCapture = (type: 'sn' | 'imei') => {
        if (!isTelegramWebApp) {
            alert('Функция камеры доступна только в Telegram WebApp');
            return;
        }

        const webApp = (window as any).Telegram.WebApp;
        
        // Настройки для камеры
        const cameraOptions = {
            source: 'camera', // Используем камеру, а не галерею
            quality: 'high'   // Высокое качество для лучшего OCR
        };
        
        console.log(`Открываем камеру для ${type === 'sn' ? 'S/N' : 'IMEI'}`);
        
        webApp.openCamera(cameraOptions, (result: any) => {
            console.log('Результат камеры:', result);
            
            if (result && result.photos && result.photos.length > 0) {
                const photoBlob = result.photos[0];
                console.log(`Фото ${type} получено, размер:`, photoBlob.size);
                
                if (type === 'sn') {
                    setPhotos(prev => ({ ...prev, snPhoto: photoBlob }));
                } else {
                    setPhotos(prev => ({ ...prev, imeiPhoto: photoBlob }));
                }
                
                // Показываем уведомление об успехе
                webApp.showAlert(`Фото ${type === 'sn' ? 'S/N' : 'IMEI'} успешно сделано!`);
            } else {
                console.log('Фото не было сделано или произошла ошибка');
                webApp.showAlert('Не удалось сделать фото. Попробуйте еще раз.');
            }
        });
        
        // Обработка ошибок камеры
        webApp.onEvent('cameraError', (error: any) => {
            console.error('Ошибка камеры:', error);
            webApp.showAlert('Ошибка доступа к камере. Проверьте разрешения.');
        });
    };

    // Функция для обработки OCR
    const processOCR = async () => {
        setIsProcessing(true);
        setProcessingProgress(0);
        setProcessingMessage('Подготовка изображений...');
        setOcrError(null);
        
        let progressInterval: NodeJS.Timeout | undefined;
        
        try {
            const formData = new FormData();
            
            // Добавляем изображения в зависимости от выбранного способа
            if (selectedMethod === 'screenshot') {
                if (screenshots.snScreenshot) {
                    formData.append('snImage', screenshots.snScreenshot);
                }
                if (screenshots.imeiScreenshot) {
                    formData.append('imeiImage', screenshots.imeiScreenshot);
                }
            } else if (selectedMethod === 'photo') {
                if (photos.snPhoto) {
                    formData.append('snImage', photos.snPhoto);
                }
                if (photos.imeiPhoto) {
                    formData.append('imeiImage', photos.imeiPhoto);
                }
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
            
            // Запускаем прогресс-бар во время обработки
            progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev < 70) {
                        return prev + 2;
                    }
                    return prev;
                });
            }, 200);
            
            const response = await fetch('/api/ocr/process-device-photos', {
                method: 'POST',
                body: formData
            });
            
            clearInterval(progressInterval);
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
            
            // Показываем диалог подтверждения
            setShowDialog(true);
            
        } catch (error) {
            console.error('OCR processing error:', error);
            setOcrError(error instanceof Error ? error.message : 'Ошибка обработки изображений');
        } finally {
            // Очищаем интервал если он был создан
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            setIsProcessing(false);
            setProcessingProgress(0);
            setProcessingMessage('');
        }
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
        if (selectedMethod === 'screenshot') {
            return screenshots.snScreenshot && screenshots.imeiScreenshot;
        } else if (selectedMethod === 'photo') {
            return photos.snPhoto && photos.imeiPhoto;
        }
        return false;
    }, [selectedMethod, screenshots, photos]);

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
        setScreenshots({ snScreenshot: null, imeiScreenshot: null });
        setPhotos({ snPhoto: null, imeiPhoto: null });
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

                        {/* Выбор способа ввода */}
                        {!selectedMethod && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                <Card 
                                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                    onClick={() => setSelectedMethod('screenshot')}
                                >
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <span className="text-2xl">📸</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">Сделать скриншот</h3>
                                                <p className="text-sm text-gray-600">Для вашего текущего телефона</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                    onClick={() => setSelectedMethod('photo')}
                                >
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <span className="text-2xl">📷</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">Сфотографировать устройство</h3>
                                                <p className="text-sm text-gray-600">Для продажи другого телефона</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Контент для выбранного способа */}
                        <AnimatePresence mode="wait">
                            {selectedMethod && (
                                <motion.div
                                    key={selectedMethod}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {selectedMethod === 'screenshot' && (
                                        <ScreenshotMethod 
                                            screenshots={screenshots}
                                            onScreenshotUpload={handleScreenshotUpload}
                                            isProcessing={isProcessing}
                                            processingProgress={processingProgress}
                                            processingMessage={processingMessage}
                                        />
                                    )}
                                    
                                    {selectedMethod === 'photo' && (
                                        <PhotoMethod 
                                            photos={photos}
                                            onPhotoCapture={handlePhotoCapture}
                                            isProcessing={isProcessing}
                                            processingProgress={processingProgress}
                                            processingMessage={processingMessage}
                                            isTelegramWebApp={isTelegramWebApp}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                                    setScreenshots({ snScreenshot: null, imeiScreenshot: null });
                                                    setPhotos({ snPhoto: null, imeiPhoto: null });
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

                        {/* Кнопка возврата к выбору способа */}
                        {selectedMethod && !isProcessing && !ocrResult && !ocrError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedMethod(null)}
                                    className="w-full"
                                >
                                    ← Выбрать другой способ
                                </Button>
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
                                        setScreenshots({ snScreenshot: null, imeiScreenshot: null });
                                        setPhotos({ snPhoto: null, imeiPhoto: null });
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
    screenshots: { snScreenshot: File | null; imeiScreenshot: File | null };
    onScreenshotUpload: (type: 'sn' | 'imei', file: File | null) => void;
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

            {/* Скриншот S/N */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Скриншот 1: S/N (верхняя часть)</h4>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            onScreenshotUpload('sn', file || null);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {screenshots.snScreenshot && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Скриншот S/N загружен
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onScreenshotUpload('sn', null)}
                                className="text-xs"
                            >
                                Заменить
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Скриншот IMEI */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Скриншот 2: IMEI (нижняя часть)</h4>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            onScreenshotUpload('imei', file || null);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {screenshots.imeiScreenshot && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Скриншот IMEI загружен
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onScreenshotUpload('imei', null)}
                                className="text-xs"
                            >
                                Заменить
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

// Компонент для метода фото
const PhotoMethod = ({ 
    photos, 
    onPhotoCapture, 
    isProcessing,
    processingProgress,
    processingMessage,
    isTelegramWebApp 
}: {
    photos: { snPhoto: Blob | null; imeiPhoto: Blob | null };
    onPhotoCapture: (type: 'sn' | 'imei') => void;
    isProcessing: boolean;
    processingProgress: number;
    processingMessage: string;
    isTelegramWebApp: boolean;
}) => {
    return (
        <div className="space-y-3">
            {/* Инструкции */}
            <Card className="p-3 bg-green-50 border border-green-200">
                <CardContent>
                    <h4 className="font-semibold text-green-800 mb-2">
                        📷 Как сфотографировать:
                    </h4>
                    <ol className="text-sm text-green-700 space-y-1">
                        <li>1. Возьмите другой телефон</li>
                        <li>2. Нажмите &quot;Открыть камеру&quot; - откроется камера Telegram</li>
                        <li>3. Сфотографируйте наклейку на коробке или заднюю панель</li>
                        <li>4. Убедитесь, что S/N и IMEI четко видны</li>
                        <li>5. Сделайте 2 отдельных фото: одно для S/N, другое для IMEI</li>
                    </ol>
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-600">
                        💡 <strong>Совет:</strong> Камера Telegram автоматически сохранит фото и вернет вас в приложение
                    </div>
                </CardContent>
            </Card>

            {/* Фото S/N */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Фото 1: S/N (верхняя часть)</h4>
                    <Button
                        onClick={() => onPhotoCapture('sn')}
                        disabled={!isTelegramWebApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        📷 Открыть камеру для S/N
                    </Button>
                    {!isTelegramWebApp && (
                        <p className="text-xs text-red-600">
                            ⚠️ Функция камеры доступна только в Telegram
                        </p>
                    )}
                    {photos.snPhoto && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Фото S/N сделано
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPhotoCapture('sn')}
                                disabled={!isTelegramWebApp}
                                className="text-xs"
                            >
                                📷 Переснять
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Фото IMEI */}
            <Card className="p-3 border border-gray-200">
                <CardContent className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Фото 2: IMEI (нижняя часть)</h4>
                    <Button
                        onClick={() => onPhotoCapture('imei')}
                        disabled={!isTelegramWebApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        📷 Открыть камеру для IMEI
                    </Button>
                    {!isTelegramWebApp && (
                        <p className="text-xs text-red-600">
                            ⚠️ Функция камеры доступна только в Telegram
                        </p>
                    )}
                    {photos.imeiPhoto && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Фото IMEI сделано
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPhotoCapture('imei')}
                                disabled={!isTelegramWebApp}
                                className="text-xs"
                            >
                                📷 Переснять
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
                                <span>{processingMessage || 'Обрабатываем фото...'}</span>
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
