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
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<null | { model?: string; variant?: string; storage?: string; color?: string; image?: string; raw?: any }>(null);
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);

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
        }
        addDebugInfo('Страница device-info загружена');
        addDebugInfo(`telegramId: ${telegramId || 'НЕТ'}`);
        addDebugInfo(`username: ${username || 'НЕТ'}`);
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
        setChecking(true);
        try {
            setSerialNumber(manualSerialNumber);
            // Try Reincubate (via ZenRows HTML parse) first
            const reRes = await fetch('/api/serial-check/reincubate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sn: manualSerialNumber })
            });
            if (reRes.ok) {
                const reData = await reRes.json();
                const normalized = reData?.normalized;
                const parsed = normalized ? {
                    model: normalized.model || '',
                    variant: normalized.variant || '',
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
                const parsed = normalizeFromRaw(snData);
                setCheckResult(parsed);
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

    // TEST: показать диалог без реальных запросов, с мок-данными
    const handleTest = () => {
        setIsTestLoading(true)
        setTimeout(() => {
            // Префилл под структуру формы: model='X', variant='R' (XR), storage='128GB', color='Black'
            setCheckResult({
                model: 'X',
                variant: 'R',
                storage: '128GB',
                color: 'Black',
                image: 'https://sources.imeicheck.net/images/64664f0891ea173f2986918043423f9e.png',
                raw: { sample: true },
            })
            setIsTestLoading(false)
            setShowCheckDialog(true)
        }, 1000)
    }

    const normalizeFromRaw = (snData: any) => {
        // Best-effort normalization. Adjust when actual API format is known
        const raw = snData?.data || snData?.raw || snData;
        const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
        const out: any = { raw };
        // naive heuristics
        const modelMatch = text.match(/iPhone\s?(\d+\s?(Pro\s?Max|Pro|Plus|mini)?)/i);
        if (modelMatch) {
            out.model = modelMatch[1].replace(/\s+/g, ' ').trim();
            if (/Pro Max/i.test(modelMatch[2] || '')) out.variant = 'Pro Max';
            else if (/Pro/i.test(modelMatch[2] || '')) out.variant = 'Pro';
            else if (/Plus/i.test(modelMatch[2] || '')) out.variant = 'Plus';
            else if (/mini/i.test(modelMatch[2] || '')) out.variant = 'mini';
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
            <div className="w-full bg-gradient-to-b from-white to-gray-50 flex flex-col h-full justify-center items-center min-h-screen">
                <div className="w-full max-w-md mx-auto flex flex-col gap-2 px-4">
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
                        <div className="mt-2">
                            <Button
                                variant="outline"
                                onClick={handleTest}
                                className="w-full text-[11px]"
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

            {/* SN parsed confirm dialog */}
            <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
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
                        <div className="flex justify-between"><span className="text-gray-500">Вариант</span><span className="font-semibold">{checkResult?.variant || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Память</span><span className="font-semibold">{checkResult?.storage || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Цвет</span><span className="font-semibold">{checkResult?.color || '—'}</span></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                            className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white text-sm"
                            onClick={async () => {
                                if (!checkResult) return;
                                // 1) Сохраняем префилл для совместимости
                                const prefill = {
                                    model: checkResult.model || '',
                                    variant: checkResult.variant || '',
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
                                    const attemptFetch = async (m: string, v: string, s: string, c: string) => {
                                        const p = new URLSearchParams({ model: m, storage: s, color: c });
                                        if (v) p.set('variant', v);
                                        const r = await fetch(`/api/devices/device?${p.toString()}`, { method: 'GET' });
                                        if (!r.ok) return null;
                                        return r.json();
                                    }

                                    const primary = await attemptFetch(prefill.model, prefill.variant, prefill.storage, prefill.color);
                                    let device = primary;

                                    // Фоллбек по цвету: C ↔ Bl (разные кодировки чёрного для XR)
                                    if (!device) {
                                        const altColor = prefill.color === 'C' ? 'Bl' : (prefill.color === 'Bl' ? 'C' : '');
                                        if (altColor) {
                                            device = await attemptFetch(prefill.model, prefill.variant, prefill.storage, altColor);
                                        }
                                    }

                                    // Фоллбек по варианту: убрать вариант, если не найдено
                                    if (!device && prefill.variant) {
                                        device = await attemptFetch(prefill.model, '', prefill.storage, prefill.color);
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
                                    const variantLabel = prefill.variant ? ` ${prefill.variant}` : ''
                                    const modelname = `Apple iPhone ${prefill.model}${variantLabel} ${prefill.storage} ${colorLabel}`.trim()
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

                                setShowCheckDialog(false);
                                try { sessionStorage.setItem('previousStepPath', '/request/device-info'); } catch {}
                                router.push('/request/evaluation');
                            }}
                        >
                            Данные совпадают
                        </Button>
                        <Button
                            variant="outline"
                            className="text-sm"
                            onClick={() => {
                                setShowCheckDialog(false);
                                router.push('/request/form');
                            }}
                        >
                            Выбрать вручную
                        </Button>
                    </div>
                    <div className="mt-2">
                        <p className="text-[10px] text-gray-500 break-words">SN: {manualSerialNumber}</p>
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