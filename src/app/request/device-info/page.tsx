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
import { WelcomeModal } from '@/components/ui/welcome-modal';
import { getPictureUrl } from '@/core/lib/assets';
import { useIPhoneAdaptive } from '@/hooks/useIPhoneAdaptive';
import { createIMEICheck, parseIMEIDeviceData, saveDeviceDataToDB } from '@/core/lib/imeicheckUtils';

export default function DeviceInfoPage() {
    const {
        telegramId,
        username,
        serialNumber,
        setSerialNumber,
        resetAllStates,
        setCurrentStep,
        setModel,
    } = useAppStore();
    const router = useRouter();
    
    // iPhone-адаптивные размеры
    const { adaptiveSizes, isTelegramWebApp, telegramUtils } = useIPhoneAdaptive();
    
    const [manualSerialNumber, setManualSerialNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<null | { model?: string; variant?: string; storage?: string; color?: string; image?: string; raw?: any }>(null);
    const [showCheckDialog, setShowCheckDialog] = useState(false);
    const [isDialogLocked, setIsDialogLocked] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setCurrentStep('device-info');
        // Принудительно очищаем старые данные из sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('currentStep');
            sessionStorage.setItem('currentStep', 'device-info');
            // Добавляем флаг, что пользователь активно работает на этой странице
            sessionStorage.setItem('activeOnDeviceInfo', 'true');
        }
        
        // Очищаем флаг при размонтировании компонента
        return () => {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('activeOnDeviceInfo');
            }
        };
    }, [setCurrentStep]);

    // Валидация серийного номера
    const validateSerialNumber = (sn: string): boolean => {
        // Проверяем длину (10 или 12 символов)
        if (sn.length !== 10 && sn.length !== 12) {
            return false;
        }
        
        // Проверяем, что содержит только буквы и цифры
        if (!/^[A-Z0-9]+$/.test(sn)) {
            return false;
        }
        
        // Проверяем, что не содержит только цифры или только буквы
        if (/^[0-9]+$/.test(sn) || /^[A-Z]+$/.test(sn)) {
            return false;
        }
        
        return true;
    };

    // Защита от дурака - проверка на бессмысленные SN
    const isDumbSerialNumber = (sn: string): boolean => {
        // Проверяем на одинаковые символы (например: AAAAAAAAAA, 1111111111)
        const allSame = /^(.)\1+$/.test(sn);
        if (allSame) {
            return true;
        }

        // Проверяем на последовательности (например: ABCDEFGHIJ, 1234567890)
        const isSequential = /^(?:[A-Z](?=[B-Z])|[0-9](?=[0-9]))+$/.test(sn);
        if (isSequential) {
            return true;
        }

        // Проверяем на повторяющиеся паттерны (например: ABABABABAB, 1212121212)
        const hasRepeatingPattern = /^(.{1,3})\1{2,}$/.test(sn);
        if (hasRepeatingPattern) {
            return true;
        }

        // Проверяем на слишком простые комбинации (например: A1A1A1A1A1)
        const tooSimple = /^([A-Z][0-9]){3,}$/.test(sn);
        if (tooSimple) {
            return true;
        }

        return false;
    };

    const handleInputChange = (value: string) => {
        setManualSerialNumber(value);
        setError('');
        // Кнопка активна только при правильной длине SN (10 или 12 символов)
        setIsValid(value.length === 10 || value.length === 12);
    };

    const handleConfirm = async () => {
        if (!manualSerialNumber) {
            setErrorMessage('Пожалуйста, введите серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (manualSerialNumber.length !== 10 && manualSerialNumber.length !== 12) {
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (!validateSerialNumber(manualSerialNumber)) {
            setErrorMessage('Введён некорректный серийный номер');
            setShowErrorDialog(true);
            return;
        }

        // Защита от дурака - проверяем на бессмысленные SN
        if (isDumbSerialNumber(manualSerialNumber)) {
            setErrorMessage('Серийный номер выглядит некорректно. Переходим к ручному выбору устройства.');
            setShowErrorDialog(true);
            
            // Сохраняем SN и переходим к форме без API запроса
            setTimeout(() => {
                setSerialNumber(manualSerialNumber);
                router.push('/request/form');
            }, 2000);
            return;
        }

        setIsProcessing(true);
        setShowDialog(true);
    };

    const handleContinue = async () => {
        setShowDialog(false);
        setChecking(true);
        setError('');
        
        try {
            setSerialNumber(manualSerialNumber);
            
            // Получаем данные через единый API
            console.log('🔍 Вызываем единый API для проверки:', manualSerialNumber);
            const result = await createIMEICheck(manualSerialNumber);
            console.log('🔍 Результат единого API:', result);
            
            if (!result || result.status !== 'completed') {
                throw new Error('Не удалось получить данные устройства');
            }

            console.log('✅ Получены данные от imeicheck:', result.data);
            
            // Парсим данные устройства
            console.log('🔍 Вызываем parseIMEIDeviceData с result:', result);
            let parsedData = null;
            try {
                parsedData = parseIMEIDeviceData(result);
                console.log('🔍 parsedData result:', parsedData);
            } catch (parseError) {
                console.error('❌ Ошибка парсинга:', parseError);
            }
            
            if (parsedData) {
                // Сохраняем данные в БД
                await saveDeviceDataToDB(telegramId || '', manualSerialNumber, result.data, username || undefined);
                
                // Показываем диалог с данными
                setCheckResult(parsedData);
                setShowCheckDialog(true);
            } else {
                console.log('❌ Failed to parse device data');
                throw new Error('Не удалось распарсить данные устройства');
            }
            
        } catch (apiError) {
            console.error('❌ Ошибка API imeicheck:', apiError);
            
            // Если API недоступен, переходим на форму для ручного ввода
            setError('Сервис недоступен. Введите данные вручную.');
            setTimeout(() => {
                router.push('/request/form');
            }, 2000);
        } finally {
            setChecking(false);
            setIsProcessing(false);
        }
    };

    const mapColorToCode = (label: string) => {
        const map: Record<string,string> = { 'GOLD':'G', 'RED':'R', 'BLUE':'Bl', 'WHITE':'Wh', 'BLACK':'Bl', 'PURPLE':'Pu', 'GREEN':'Gr', 'SILVER':'St' };
        return map[label.toUpperCase?.() || label] || '';
    }

    const handleEdit = () => {
        setShowDialog(false);
    };

    return (
        <Page back={true}>
            <div 
                className={`w-full bg-gradient-to-b from-white to-gray-50 flex flex-col h-full justify-center items-center min-h-screen ${telegramUtils.telegramClasses.container}`}
                data-checking={checking}
                data-transitioning={isTransitioning}
                style={{
                    minHeight: isTelegramWebApp ? '100vh' : '100vh',
                }}
            >
                <div className="w-full max-w-md mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="mb-6">
                            <Image
                                src={getPictureUrl('logo_repair.png')}
                                alt="Logo"
                                width={80}
                                height={80}
                                className="mx-auto"
                            />
                        </div>
                        <h1 className={`${adaptiveSizes.titleSize} font-bold text-gray-900 mb-2`}>
                            Введите серийный номер
                        </h1>
                        <p className={`${adaptiveSizes.bodySize} text-gray-600 mb-4`}>
                            Найдем информацию о вашем устройстве
                        </p>
                        
                        {/* Анимация с инструкцией */}
                        <div className="mb-6">
                            <Image
                                src={getPictureUrl('animation.gif')}
                                alt="Как найти серийный номер"
                                width={200}
                                height={150}
                                className="mx-auto rounded-lg shadow-sm"
                            />
                            <p className={`${adaptiveSizes.captionSize} text-gray-500 mt-2 text-center`}>
                                Серийный номер находится в настройках iPhone
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block ${adaptiveSizes.bodySize} font-medium text-gray-700 mb-2`}>
                                            Серийный номер
                                        </label>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={manualSerialNumber}
                                            onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                            placeholder="Введите серийный номер"
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent transition-colors ${adaptiveSizes.bodySize}`}
                                            maxLength={12}
                                        />
                                        {error && (
                                            <p className={`mt-2 text-xs text-red-600`}>
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            onClick={handleConfirm}
                            disabled={!isValid || isProcessing}
                            className={`w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${adaptiveSizes.buttonHeight} ${adaptiveSizes.bodySize}`}
                        >
                            {isProcessing ? 'Обработка...' : 'Продолжить'}
                        </Button>
                    </motion.div>
                </div>
            </div>

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                onStart={() => setShowWelcomeModal(false)}
            />

            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className={`bg-white border border-gray-200 w-[90vw] max-w-sm mx-auto rounded-lg shadow-lg ${adaptiveSizes.dialogMaxHeight} ${telegramUtils.telegramClasses.container} px-3 py-4`}
                    showCloseButton={false}
                >
                    <DialogTitle className={`text-center text-sm font-semibold text-gray-900 mb-2`}>
                        📱 Подтверждение
                    </DialogTitle>
                    <div className="text-center">
                        <div className="bg-[#2dc2c6]/10 rounded-lg p-2 border border-[#2dc2c6] mb-2">
                            <div className="text-xs text-gray-600 mb-1">Серийный номер:</div>
                            <div className="font-semibold text-gray-900 break-words text-sm">
                                {manualSerialNumber}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                            Нажмите &quot;Продолжить&quot; для перехода
                        </p>
                        
                        {/* Кнопка подтверждения */}
                        <div className="mt-4 flex gap-2 justify-center">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="px-4 py-2 text-xs"
                            >
                                ✏️ Редактировать
                            </Button>
                            <Button
                                onClick={handleContinue}
                                className="px-4 py-2 text-xs bg-[#2dc2c6] hover:bg-[#25a8ac] text-white"
                            >
                                ✅ Продолжить
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* SN parsed confirm dialog */}
            <Dialog open={showCheckDialog} onOpenChange={(v) => { if (!isDialogLocked) setShowCheckDialog(v) }}>
                <DialogContent className={`bg-white border border-gray-200 w-[90vw] max-w-sm mx-auto rounded-lg shadow-lg ${adaptiveSizes.dialogMaxHeight} ${telegramUtils.telegramClasses.container} px-3 py-4`} showCloseButton={false}>
                    <DialogTitle className="text-center text-base font-semibold text-gray-900 mb-2">
                        📱 Данные устройства
                    </DialogTitle>
                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Модель</span><span className="font-semibold">{checkResult?.model || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Память</span><span className="font-semibold">{checkResult?.storage || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Цвет</span><span className="font-semibold">{checkResult?.color || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">S/N</span><span className="font-semibold">{checkResult?.raw?.data?.properties?.serial || manualSerialNumber || '—'}</span></div>
                        </div>
                        <div className="mt-3">
                            <Button
                                className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white text-sm"
                                onClick={async () => {
                                    if (!checkResult) return;
                                    console.log('🔍 checkResult:', checkResult);
                                    setIsDialogLocked(true);
                                    setIsTransitioning(true);
                                    // 1) Сохраняем префилл для совместимости
                                    const prefill = {
                                        model: checkResult.model === 'X' && checkResult.variant === 'R' ? 'XR' : 
                                               checkResult.model === 'X' && checkResult.variant === 'S' ? 'XS' :
                                               checkResult.model === 'SE' ? 'SE' :
                                               checkResult.model === 'Модель не указана' ? 'Модель не указана' :
                                               checkResult.model || '',
                                        variant: checkResult.variant || '',
                                        storage: checkResult.storage || '',
                                        color: mapColorToCode(checkResult.color || ''),
                                    };
                                    
        // Сохраняем modelname в store
        const fullModelName = checkResult.model === 'Модель не указана' 
            ? 'Модель не указана'
            : `iPhone ${checkResult.model} ${checkResult.storage} ${checkResult.color}`;
        setModel(fullModelName);
                                    console.log('🔍 prefill:', prefill);
                                    try {
                                        sessionStorage.setItem('prefillSelection', JSON.stringify(prefill));
                                        // Также сохраняем как phoneSelection, чтобы страница submit корректно вывела цвет/память без прохождения form
                                        sessionStorage.setItem('phoneSelection', JSON.stringify(prefill));
                                    } catch {}

                                    // 2) Отправляем данные на сервер
                                    try {
                                        await fetch('/api/request/choose', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                telegramId,
                                                username: username || 'Unknown',
                                                currentStep: 'evaluation',
                                                modelname: checkResult.model === 'Модель не указана' 
                                                    ? 'Модель не указана'
                                                    : `Apple iPhone ${prefill.model} ${prefill.storage} ${prefill.color}`.trim()
                                            }),
                                        });
                                    } catch {}

                                    // 3) Переходим на следующую страницу
                                    try {
                                        await fetch('/api/request/saveCurrentStep', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                telegramId,
                                                username: username || 'Unknown',
                                                currentStep: 'evaluation',
                                                modelname: checkResult.model === 'Модель не указана' 
                                                    ? 'Модель не указана'
                                                    : `Apple iPhone ${prefill.model} ${prefill.storage} ${prefill.color}`.trim()
                                            }),
                                        });
                                    } catch {}

                                    try { sessionStorage.setItem('previousStepPath', '/request/device-info'); } catch {}
                                    // Небольшая задержка, чтобы пользователь видел, что идёт переход
                                    setTimeout(() => {
                                      router.push('/request/form');
                                    }, 50);
                                }}
                            >
                                {isTransitioning ? 'Переходим…' : 'Данные совпадают'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent
                    className={`bg-white border border-gray-200 w-[90vw] max-w-sm mx-auto rounded-lg shadow-lg ${adaptiveSizes.dialogMaxHeight} ${telegramUtils.telegramClasses.container} px-3 py-4`}
                    showCloseButton={false}
                >
                    <DialogTitle className="text-center text-base font-semibold text-gray-900 mb-2">
                        📱 Данные не найдены
                    </DialogTitle>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Не удалось определить модель устройства по серийному номеру
                        </p>
                        <Button
                            onClick={() => {
                                setShowErrorDialog(false);
                                router.push('/request/form');
                            }}
                            className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white"
                        >
                            Заполнить данные вручную
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Page>
    );
}