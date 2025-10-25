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
import { useTestDevices } from '@/hooks/useTestDevices';
import { TestDeviceSelector } from '@/components/TestDeviceSelector';

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
    
    // iPhone-адаптивные размеры
    const { adaptiveSizes, isTelegramWebApp, telegramUtils } = useIPhoneAdaptive();
    
    // Тестовые устройства
    const { 
        testDevices, 
        isLoading: isLoadingTestDevices, 
        findTestDeviceBySerial, 
        createTestDeviceForSerial 
    } = useTestDevices();

    // Отладочная информация
    console.log('📱 DeviceInfoPage тестовые устройства:', {
        count: testDevices.length,
        devices: testDevices.map(d => ({ id: d.id, name: d.name, serial: d.serial })),
        isLoading: isLoadingTestDevices
    });

    const [manualSerialNumber, setManualSerialNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<null | { model?: string; storage?: string; color?: string; image?: string; raw?: any }>(null);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [isDialogLocked, setIsDialogLocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [showTestDeviceSelector, setShowTestDeviceSelector] = useState(false);

    const addDebugInfo = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;
        console.log(debugMessage); // Simplified for production
    };

    useEffect(() => {
        setCurrentStep('device-info');
        // Принудительно очищаем старые данные из sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('currentStep');
            sessionStorage.setItem('currentStep', 'device-info');
            // Добавляем флаг, что пользователь активно работает на этой странице
            sessionStorage.setItem('activeOnDeviceInfo', 'true');
        }
        addDebugInfo('Страница device-info загружена');
        addDebugInfo(`telegramId: ${telegramId || 'НЕТ'}`);
        addDebugInfo(`username: ${username || 'НЕТ'}`);
        
        // Очищаем флаг при размонтировании компонента
        return () => {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('activeOnDeviceInfo');
            }
        };
    }, [setCurrentStep, telegramId, username]);

    // Фиксируем шаг в БД при заходе на страницу
    useEffect(() => {
        const updateStep = async () => {
            if (!telegramId) return;
            try {
                await fetch('/api/request/choose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegramId,
                        username: username || 'Unknown',
                        currentStep: 'device-info',
                    }),
                });
            } catch (error) {
                console.error('Error updating currentStep (device-info):', error);
            }
        };
        updateStep();
    }, [telegramId, username]);

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


    const validateSerialNumber = (sn: string): boolean => {
        if (sn.length < 10 || sn.length > 12) {
            return false;
        }
        if (!/^[A-Za-z0-9]+$/.test(sn)) {
            return false;
        }
        return true;
    };

    // Защита от дурака - проверка на бессмысленные SN
    const isDumbSerialNumber = (sn: string): boolean => {
        // Проверяем на одинаковые символы (например: AAAAAAAAAA, 1111111111)
        const allSame = /^(.)\1+$/.test(sn);
        if (allSame) {
            addDebugInfo(`🤖 Обнаружен "дурацкий" SN: все символы одинаковые`);
            return true;
        }

        // Проверяем на последовательности (например: ABCDEFGHIJ, 1234567890)
        const isSequential = /^(?:[A-Z](?=[B-Z])|[0-9](?=[0-9]))+$/.test(sn);
        if (isSequential) {
            addDebugInfo(`🤖 Обнаружен "дурацкий" SN: последовательные символы`);
            return true;
        }

        // Проверяем на повторяющиеся паттерны (например: ABABABABAB, 1212121212)
        const hasRepeatingPattern = /^(.{1,3})\1{2,}$/.test(sn);
        if (hasRepeatingPattern) {
            addDebugInfo(`🤖 Обнаружен "дурацкий" SN: повторяющийся паттерн`);
            return true;
        }

        // Проверяем на слишком простые комбинации (например: A1A1A1A1A1)
        const tooSimple = /^([A-Z][0-9]){3,}$/.test(sn);
        if (tooSimple) {
            addDebugInfo(`🤖 Обнаружен "дурацкий" SN: слишком простая комбинация`);
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
        addDebugInfo('Нажата кнопка "Продолжить"');
        if (!manualSerialNumber) {
            addDebugInfo('❌ Серийный номер не введен');
            setErrorMessage('Пожалуйста, введите серийный номер');
            setShowErrorDialog(true);
            return;
        }

        if (manualSerialNumber.length !== 10 && manualSerialNumber.length !== 12) {
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

        // Защита от дурака - проверяем на бессмысленные SN
        if (isDumbSerialNumber(manualSerialNumber)) {
            addDebugInfo('🤖 Обнаружен подозрительный SN, переходим к форме без API запроса');
            setErrorMessage('Серийный номер выглядит некорректно. Переходим к ручному выбору устройства.');
            setShowErrorDialog(true);
            
            // Сохраняем SN и переходим к форме без API запроса
            setTimeout(() => {
                setSerialNumber(manualSerialNumber);
                fetch('/api/request/device-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegramId, username: username || 'Unknown', serialNumber: manualSerialNumber }),
                }).catch(() => {});
                router.push('/request/form');
            }, 2000);
            return;
        }

        addDebugInfo('✅ Серийный номер прошел валидацию');
        setShowDialog(true);
    };

    const handleContinue = async () => {
        setShowDialog(false);
        setChecking(true);
        try {
            setSerialNumber(manualSerialNumber);
            
            // Проверяем, есть ли тестовые данные для этого серийного номера
            const existingTestDevice = findTestDeviceBySerial(manualSerialNumber);
            
            if (existingTestDevice) {
                // Используем существующие тестовые данные
                addDebugInfo(`✅ Найдены тестовые данные для SN: ${manualSerialNumber}`);
                // Умный парсинг модели из deviceName (поддержка iPhone XR, 17 Air, Pro, Pro Max)
                const getFullModelName = (deviceName: string): string => {
                    // Сначала пробуем найти номер модели (iPhone 14, 15, 16, 17)
                    const numberMatch = deviceName.match(/iPhone\s+(\d+)/);
                    if (numberMatch) {
                        return numberMatch[1];
                    }
                    
                    // Затем пробуем найти буквенные модели (XR, XS, XS Max)
                    const letterMatch = deviceName.match(/iPhone\s+([A-Z][A-Za-z\s]*?)(?:\s+\d+GB|\s+\[)/);
                    if (letterMatch) {
                        const model = letterMatch[1].trim();
                        // Специальная обработка для XR - в БД это model: 'X', variant: 'R'
                        if (model === 'XR') {
                            return 'X';
                        }
                        return model;
                    }
                    
                    return 'Unknown';
                };

                console.log('📱 Тестовые данные найдены:', existingTestDevice.data);
                const parsed = {
                    model: getFullModelName(existingTestDevice.normalized?.deviceName || ''),
                    storage: existingTestDevice.normalized?.deviceName?.match(/(\d+GB)/)?.[1] || '128GB',
                    color: existingTestDevice.normalized?.deviceName?.includes('Black') ? 'Black' : 'White',
                    image: existingTestDevice.normalized?.image || '',
                    raw: existingTestDevice.data,
                };
                setCheckResult(parsed);
            } else {
                // Создаем новые тестовые данные для этого серийного номера
                addDebugInfo(`🆕 Создаем новые тестовые данные для SN: ${manualSerialNumber}`);
                const newTestDevice = await createTestDeviceForSerial(manualSerialNumber, {
                    deviceName: `iPhone 13 Pro 256GB Black [A2639] [iPhone14,2]`,
                    image: 'https://sources.imeicheck.net/images/64664f0891ea173f2986918043423f9e.png',
                    imei: '',
                    warrantyStatus: 'Out Of Warranty',
                    simLock: false,
                    fmiOn: false,
                    lostMode: false,
                    usaBlockStatus: 'Clean',
                    network: 'Global'
                });
                
                if (newTestDevice) {
                    // Умный парсинг модели из deviceName (поддержка iPhone XR, 17 Air, Pro, Pro Max)
                    const getFullModelName = (deviceName: string): string => {
                        // Сначала пробуем найти номер модели (iPhone 14, 15, 16, 17)
                        const numberMatch = deviceName.match(/iPhone\s+(\d+)/);
                        if (numberMatch) {
                            return numberMatch[1];
                        }
                        
                        // Затем пробуем найти буквенные модели (XR, XS, XS Max)
                        const letterMatch = deviceName.match(/iPhone\s+([A-Z][A-Za-z\s]*?)(?:\s+\d+GB|\s+\[)/);
                        if (letterMatch) {
                            const model = letterMatch[1].trim();
                            // Специальная обработка для XR - в БД это model: 'X', variant: 'R'
                            if (model === 'XR') {
                                return 'X';
                            }
                            return model;
                        }
                        
                        return 'Unknown';
                    };

                    const parsed = {
                        model: getFullModelName(newTestDevice.normalized?.deviceName || ''),
                        storage: newTestDevice.normalized?.deviceName?.match(/(\d+GB)/)?.[1] || '128GB',
                        color: newTestDevice.normalized?.deviceName?.includes('Black') ? 'Black' : 'White',
                        image: newTestDevice.normalized?.image || '',
                        raw: newTestDevice.data,
                    };
                    setCheckResult(parsed);
                } else {
                    // Fallback к реальным API запросам
                    addDebugInfo('⚠️ Переходим к реальным API запросам');
                    
                    // Try Reincubate (via ZenRows HTML parse) first
                    const reRes = await fetch('/api/serial-check/reincubate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sn: manualSerialNumber })
                    });
                    if (reRes.ok) {
                        const reData = await reRes.json();
                        console.log('📱 API Reincubate ответ:', reData);
                        const normalized = reData?.normalized;
                        const parsed = normalized ? {
                            model: normalized.model || '',
                            storage: normalized.storage || '',
                            color: normalized.color || '',
                            raw: reData,
                        } : normalizeFromRaw(reData);
                        setCheckResult(parsed);
                    } else {
                        // Fallback to imei.info proxy
                        const snRes = await fetch('/api/serial-check', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sn: manualSerialNumber })
                        });
                        if (!snRes.ok) {
                            console.error('SN check failed:', snRes.status, snRes.statusText);
                            router.push('/request/form');
                            return;
                        }
                        const snData = await snRes.json();
                        console.log('📱 API Fallback ответ:', snData);
                        const parsed = normalizeFromRaw(snData);
                        setCheckResult(parsed);
                    }
                }
            }

            // Save serial to DB (non-blocking)
            fetch('/api/request/device-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, username: username || 'Unknown', serialNumber: manualSerialNumber }),
            }).catch(() => {});

            setShowCheckDialog(true);
        } catch (error) {
            console.error('SN flow error:', error);
            router.push('/request/form');
        } finally {
            setChecking(false);
        }
    };

    // TEST: показать диалог выбора тестового устройства
    const handleTest = () => {
        setShowTestDeviceSelector(true);
    };

    // Обработчик выбора тестового устройства
    const handleSelectTestDevice = (device: any) => {
        setIsTestLoading(true);
        setTimeout(() => {
            // Парсим данные из выбранного тестового устройства
            const parsed = {
                model: device.normalized?.deviceName?.match(/iPhone\s+(\w+)/)?.[1] || 'X',
                variant: device.normalized?.deviceName?.includes('XR') ? 'R' : '',
                storage: device.normalized?.deviceName?.match(/(\d+GB)/)?.[1] || '128GB',
                color: device.normalized?.deviceName?.includes('Black') ? 'Black' : 'White',
                image: device.normalized?.image || 'https://sources.imeicheck.net/images/64664f0891ea173f2986918043423f9e.png',
                raw: device.data,
            };
            setCheckResult(parsed);
            setIsTestLoading(false);
            setShowCheckDialog(true);
        }, 1000);
    };

    const normalizeFromRaw = (snData: any) => {
        // Best-effort normalization. Adjust when actual API format is known
        const raw = snData?.data || snData?.raw || snData;
        const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
        const out: any = { raw };
        // Умный парсинг полного названия модели (поддержка iPhone 17 Air, Pro, Pro Max)
        const modelMatch = text.match(/iPhone\s+([^0-9\[]+)/i);
        if (modelMatch) {
            out.model = modelMatch[1].trim();
        }
        const storageMatch = text.match(/(\d+\s?GB|\d+\s?TB)/i);
        if (storageMatch) out.storage = storageMatch[1].replace(/\s+/g, '').toUpperCase();
        const colorMap: Record<string,string> = { 'GOLD':'G', 'RED':'R', 'BLUE':'Bl', 'WHITE':'Wh', 'BLACK':'C', 'PURPLE':'Pu', 'GREEN':'Gr', 'SILVER':'St' };
        const colorMatch = text.match(/color\W+([A-Za-z]+)/i);
        if (colorMatch) {
            const c = colorMatch[1].toUpperCase();
            out.color = c;
        }
        return out;
    }

    const mapColorToCode = (label: string) => {
        const map: Record<string,string> = { 'GOLD':'G', 'RED':'R', 'BLUE':'Bl', 'WHITE':'Wh', 'BLACK':'C', 'PURPLE':'Pu', 'GREEN':'Gr', 'SILVER':'St' };
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
                    minHeight: isTelegramWebApp ? `${telegramUtils.safeViewportHeight}px` : '100vh'
                }}
            >
                <div className={`w-full max-w-md mx-auto flex flex-col gap-2 px-4 ${adaptiveSizes.sectionSpacing}`}>
                    {/* Instruction Card */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className={adaptiveSizes.cardPadding}>
                                <div className={`flex flex-col items-center ${adaptiveSizes.elementSpacing}`}>
                                    <div className="w-full max-w-xs mx-auto mb-2">
                                        <Image
                                            src={getPictureUrl('animation.gif') || '/animation.gif'}
                                            alt="Инструкция по поиску серийного номера"
                                            width={telegramUtils.getTelegramAdaptiveSize(300)}
                                            height={telegramUtils.getTelegramAdaptiveSize(120)}
                                            className="w-full h-auto rounded-lg border border-blue-200"
                                        />
                                    </div>
                                    <div className={`${adaptiveSizes.captionSize} text-blue-800 ${adaptiveSizes.elementSpacing}`}>
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
                            <CardContent className={adaptiveSizes.cardPadding}>
                                <div className={adaptiveSizes.elementSpacing}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={manualSerialNumber}
                                        onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
                                        placeholder="Введите серийный номер (10 или 12 символов)"
                                        className={`w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent outline-none transition-colors ${adaptiveSizes.bodySize} ${adaptiveSizes.inputHeight}`}
                                        maxLength={12}
                                    />
                                    {/* Счетчик символов */}
                                    <div className="mt-1 text-right">
                                        <span className={`text-xs ${manualSerialNumber.length === 10 || manualSerialNumber.length === 12 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {manualSerialNumber.length}/12
                                        </span>
                                    </div>
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
                            disabled={!isValid}
                            className={`w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${adaptiveSizes.buttonHeight} ${adaptiveSizes.bodySize}`}
                        >
                            Продолжить
                        </Button>
                        <div className="mt-2">
                            <Button
                                variant="outline"
                                onClick={handleTest}
                                className={`w-full ${adaptiveSizes.bodySize} ${adaptiveSizes.buttonHeight}`}
                                disabled={isTestLoading}
                            >
                                {isTestLoading ? 'Проверяем данные…' : 'Тест (показать пример без запроса)'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                onStart={() => setShowWelcomeModal(false)}
            />

            <TestDeviceSelector
                isOpen={showTestDeviceSelector}
                onClose={() => setShowTestDeviceSelector(false)}
                onSelectDevice={handleSelectTestDevice}
                testDevices={testDevices}
                isLoading={isLoadingTestDevices}
            />

            <Dialog open={showDialog} onOpenChange={handleEdit}>
                <DialogContent
                    className={`bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg ${adaptiveSizes.dialogMaxHeight}`}
                    onClick={handleContinue}
                    showCloseButton={false}
                >
                    <DialogTitle className={`text-center ${adaptiveSizes.titleSize} font-semibold text-gray-900 mb-3`}>
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

            {/* SN parsed confirm dialog */}
            <Dialog open={showCheckDialog} onOpenChange={(v) => { if (!isDialogLocked) setShowCheckDialog(v) }}>
                <DialogContent className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg" showCloseButton={false}>
                    <DialogTitle className="text-center text-base font-semibold text-gray-900 mb-2">
                        Найдено устройство
                    </DialogTitle>
                    <div className="text-sm text-gray-800 space-y-2">
                        {checkResult?.image ? (
                            <div className="w-full flex justify-center mb-2">
                                <Image
                                    src={checkResult.image}
                                    alt={checkResult.model || 'device'}
                                    width={200}
                                    height={200}
                                    className="rounded-md border"
                                />
                            </div>
                        ) : null}
                        <div className="flex justify-between"><span className="text-gray-500">Модель</span><span className="font-semibold">{checkResult?.model || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Память</span><span className="font-semibold">{checkResult?.storage || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Цвет</span><span className="font-semibold">{checkResult?.color || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">S/N</span><span className="font-semibold">{checkResult?.raw?.data?.properties?.serial || manualSerialNumber || '—'}</span></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                            className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white text-sm"
                            onClick={async () => {
                                if (!checkResult) return;
                                setIsDialogLocked(true);
                                setIsTransitioning(true);
                                // 1) Сохраняем префилл для совместимости
                                const prefill = {
                                    model: checkResult.model || '',
                                    storage: checkResult.storage || '',
                                    color: mapColorToCode(checkResult.color || ''),
                                };
                                try {
                                    sessionStorage.setItem('prefillSelection', JSON.stringify(prefill));
                                    // Также сохраняем как phoneSelection, чтобы страница submit корректно вывела цвет/память без прохождения form
                                    sessionStorage.setItem('phoneSelection', JSON.stringify(prefill));
                                } catch {}

                                // 2) Пытаемся заранее получить устройство и цену (с фоллбэками по цвету/варианту)
                                try {
                                    const attemptFetch = async (m: string, s: string, c: string, v?: string) => {
                                        const p = new URLSearchParams({ model: m, storage: s, color: c });
                                        if (v) {
                                            p.set('variant', v);
                                        }
                                        const r = await fetch(`/api/devices/device?${p.toString()}`, { method: 'GET' });
                                        if (!r.ok) return null;
                                        return r.json();
                                    }

                                    // Определяем variant для специальных случаев
                                    let variant = '';
                                    if (prefill.model === 'X' && checkResult?.model === 'X') {
                                        // Проверяем, это ли XR по deviceName
                                        const deviceName = checkResult?.raw?.data?.properties?.deviceName || '';
                                        if (deviceName.includes('XR')) {
                                            variant = 'R';
                                        }
                                    }

                                    const primary = await attemptFetch(prefill.model, prefill.storage, prefill.color, variant);
                                    let device = primary;

                                    // Фоллбек по цвету: C ↔ Bl (разные кодировки чёрного для XR)
                                    if (!device) {
                                        const altColor = prefill.color === 'C' ? 'Bl' : (prefill.color === 'Bl' ? 'C' : '');
                                        if (altColor) {
                                            device = await attemptFetch(prefill.model, prefill.storage, altColor, variant);
                                        }
                                    }

                                    if (device?.basePrice) {
                                        try { sessionStorage.setItem('basePrice', String(device.basePrice)); } catch {}
                                    }
                                } catch {}

                                // 3) Фиксируем шаг и переходим сразу к оценке
                                try {
                                    // Подготовим modelname с правильной локалью цвета
                                    const colorLabelMap: Record<string, string> = {
                                        G: 'Золотой', R: 'Красный', Bl: 'Черный', Wh: 'Белый', C: 'Черный', Bk: 'Черный',
                                        La: 'Лаванда', Mi: 'Туманный синий', Sa: 'Шалфей', St: 'Стальной серый', Gr: 'Зеленый', Pu: 'Фиолетовый',
                                        Lb: 'Светло-голубой', Lg: 'Светло-золотой', Gy: 'Серый', Db: 'Темно-синий', Or: 'Оранжевый'
                                    }
                                    const colorLabel = colorLabelMap[prefill.color] || prefill.color
                                    const modelname = `Apple iPhone ${prefill.model} ${prefill.storage} ${colorLabel}`.trim()
                                    await fetch('/api/request/choose', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            telegramId,
                                            username: username || 'Unknown',
                                            currentStep: 'evaluation',
                                            modelname,
                                        }),
                                    });
                                } catch {}

                                try { sessionStorage.setItem('previousStepPath', '/request/device-info'); } catch {}
                                // Небольшая задержка, чтобы пользователь видел, что идёт переход
                                setTimeout(() => {
                                  router.push('/request/evaluation');
                                }, 50);
                            }}
                        >
                            {isTransitioning ? 'Переходим…' : 'Данные совпадают'}
                        </Button>
                        <Button
                            variant="outline"
                            className="text-sm"
                            onClick={() => {
                                setIsDialogLocked(true);
                                setIsTransitioning(true);
                                try {
                                  sessionStorage.removeItem('prefillSelection');
                                  sessionStorage.removeItem('phoneSelection');
                                  sessionStorage.removeItem('basePrice');
                                  sessionStorage.setItem('previousStepPath', '/request/device-info');
                                } catch {}
                                router.push('/request/form');
                            }}
                        >
                            {isTransitioning ? 'Открываем…' : 'Выбрать вручную'}
                        </Button>
                    </div>
                    {isTransitioning && (
                      <div className="mt-3 w-full flex justify-center">
                        <div className="inline-flex items-center gap-2 text-gray-500 text-xs">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                          Загрузка…
                        </div>
                      </div>
                    )}
                </DialogContent>
            </Dialog>

            {isTransitioning && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center">
                        <Image src={getPictureUrl('animation_running.gif') || '/animation_running.gif'} alt="Загрузка" width={192} height={192} className="object-contain rounded-2xl" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Переходим…</p>
                    </div>
                </div>
            )}

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