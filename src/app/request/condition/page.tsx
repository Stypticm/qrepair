'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Page } from '@/components/Page'
import { useAppStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { ConditionOption, frontConditions, backConditions, sideConditions } from '@/core/lib/condition'
import { getPictureUrl } from '@/core/lib/assets'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ImagePreloader } from '@/components/ImagePreloader/ImagePreloader'
import { getConditionImages } from '@/core/lib/imageUtils'

const SURFACE_ORDER = ['front', 'back', 'side'] as const
type SurfaceKey = typeof SURFACE_ORDER[number]

const SURFACE_META: Record<SurfaceKey, { title: string; subtitle: string; accent: string }> = {
    front: {
        title: 'Лицевая сторона',
        subtitle: 'Экран и рамка дисплея',
        accent: 'Front',
    },
    back: {
        title: 'Задняя часть',
        subtitle: 'Спинка и блок камер',
        accent: 'Back',
    },
    side: {
        title: 'Грани и кнопки',
        subtitle: 'Боковые поверхности',
        accent: 'Sides',
    },
}

// Assumed type for deviceConditions based on usage
interface DeviceConditions {
    front: string | null
    back: string | null
    side: string | null
}

export default function ConditionPage() {
    const {
        modelname,
        telegramId,
        deviceConditions,
        setDeviceConditions,
        username,
        setModel,
        setPrice,
        setCurrentStep,
        price,
    } = useAppStore()
    const router = useRouter()

    const [hasChanges, setHasChanges] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isAllSelected, setIsAllSelected] = useState(false)
    const [loadedFromDB, setLoadedFromDB] = useState(false)
    const [activeSurface, setActiveSurface] = useState<SurfaceKey>('front')
    const [hasUserInteracted, setHasUserInteracted] = useState(false)
    const [basePrice, setBasePrice] = useState<number | null>(null)
    const [showDialog, setShowDialog] = useState(false)

    // Set current step on page load
    useEffect(() => {
        setCurrentStep('condition')
    }, [setCurrentStep])

    // Load base price from sessionStorage
    useEffect(() => {
        if (typeof window === 'undefined') return
        const storedBasePrice = sessionStorage.getItem('basePrice')
        if (storedBasePrice) {
            const parsedBase = Number(storedBasePrice)
            if (!Number.isNaN(parsedBase)) {
                setBasePrice(parsedBase)
            }
        }
    }, [])

    // Update isAllSelected and activeSurface based on deviceConditions
    useEffect(() => {
        const allSelected = checkIfAllSelected(deviceConditions)
        setIsAllSelected(allSelected)

        if (!hasUserInteracted) {
            const nextSurface = SURFACE_ORDER.find((surface) => !deviceConditions[surface])
            if (nextSurface && nextSurface !== activeSurface) {
                setActiveSurface(nextSurface)
            }
        }

        // Show dialog when all conditions are selected and there are changes
        if (allSelected && hasChanges && !showDialog) {
            setShowDialog(true)
        }
    }, [deviceConditions, hasUserInteracted, activeSurface, hasChanges, showDialog])

    // Check if all conditions are selected
    const checkIfAllSelected = useCallback((conditions: DeviceConditions) => {
        return !!conditions.front && !!conditions.back && !!conditions.side
    }, [])

    // Get condition options by surface
    const getOptionsBySurface = useCallback((surface: SurfaceKey): ConditionOption[] => {
        switch (surface) {
            case 'front':
                return frontConditions
            case 'back':
                return backConditions
            case 'side':
                return sideConditions
            default:
                return frontConditions
        }
    }, [])

    // Get condition option by label
    const getOptionByLabel = useCallback(
        (surface: SurfaceKey, label: string | null) => {
            if (!label) return null
            return getOptionsBySurface(surface).find((option) => getConditionText(option.id) === label) || null
        },
        [getOptionsBySurface]
    )

    const currentOptions = useMemo(() => getOptionsBySurface(activeSurface), [activeSurface, getOptionsBySurface])

    const currentSelection = useMemo(() => {
        const existing = getOptionByLabel(activeSurface, deviceConditions[activeSurface])
        return existing || currentOptions[0] || null
    }, [activeSurface, currentOptions, deviceConditions, getOptionByLabel])

    const previewImage = useMemo(() => {
        const imageKey = currentSelection?.image ?? currentOptions[0]?.image
        return imageKey ? getPictureUrl(`${imageKey}.png`) : ''
    }, [currentSelection, currentOptions])

    const totalPenalty = useMemo(() => calculateTotalPenalty(deviceConditions), [deviceConditions])

    const estimatedPrice = useMemo(() => {
        if (price && price > 0) return price
        if (basePrice && basePrice > 0) {
            return calculateFinalPrice(basePrice, deviceConditions)
        }
        return null
    }, [basePrice, deviceConditions, price])

    const priceFormatter = useMemo(
        () =>
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
            }),
        []
    )

    const isReadyToContinue = useMemo(
        () => !!deviceConditions.front && !!deviceConditions.back && !!deviceConditions.side,
        [deviceConditions]
    )

    // Сохранение состояний в БД
    const saveConditionsToDatabase = async (newConditions: any) => {
        if (!telegramId) return;

        try {
            const response = await fetch('/api/request/saveAdditionalConditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId,
                    additionalConditions: newConditions,
                    currentStep: 'additional-condition'
                }),
            });

            if (response.ok) {
                const result = await response.json();
                // setHasChanges(true); // Убираем отсюда, так как устанавливаем раньше
            } else {
                const errorData = await response.json();
                console.error('[saveConditionsToDatabase] Ошибка сохранения дополнительных состояний в БД:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            }
        } catch (error) {
            console.error('[saveConditionsToDatabase] Ошибка при сохранении дополнительных состояний:', error);
        }
    };

    // Load saved conditions from sessionStorage or database
    const loadSavedConditions = useCallback(async () => {
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions')
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession) as DeviceConditions
                    setDeviceConditions(parsed)
                    const hasSelectedItems = parsed.front || parsed.back || parsed.side
                    if (hasSelectedItems) {
                        setIsEditing(true)
                        setIsAllSelected(checkIfAllSelected(parsed))
                        setHasChanges(true)
                    }
                    setLoadedFromDB(true)
                    return
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage:', e)
                    sessionStorage.removeItem('deviceConditions')
                }
            }
        }

        try {
            const timestamp = Date.now()
            const url = `/api/request/getConditions?t=${timestamp}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId: telegramId || 'test-user' }),
            })
            if (response.ok) {
                const data = await response.json()
                if (data.status === 'submitted') {
                    setDeviceConditions({ front: null, back: null, side: null })
                    setHasChanges(false)
                    setLoadedFromDB(true)
                    return
                }

                if (data.deviceConditions && data.status !== 'submitted') {
                    const updatedConditions = { ...data.deviceConditions }
                    let hasChanges = false
                    if (updatedConditions.front === 'Значительные царапины') {
                        updatedConditions.front = 'Заметные царапины'
                        hasChanges = true
                    }
                    if (updatedConditions.back === 'Значительные царапины') {
                        updatedConditions.back = 'Заметные царапины'
                        hasChanges = true
                    }
                    if (updatedConditions.side === 'Значительные царапины') {
                        updatedConditions.side = 'Заметные царапины'
                        hasChanges = true
                    }

                    setDeviceConditions(updatedConditions)
                    const hasSelectedItems = updatedConditions.front || updatedConditions.back || updatedConditions.side
                    if (hasSelectedItems) {
                        setIsEditing(true)
                        setIsAllSelected(checkIfAllSelected(updatedConditions))
                        setHasChanges(true)
                    }
                    if (hasChanges) {
                        setHasChanges(true)
                    }
                    setLoadedFromDB(true)
                } else {
                    setLoadedFromDB(true)
                }

                if (data.modelname) {
                    setModel(data.modelname)
                }
                if (data.price) {
                    setPrice(data.price)
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки состояний из БД:', error)
            setLoadedFromDB(true)
        }
    }, [telegramId, setDeviceConditions, setModel, setPrice, checkIfAllSelected])

    // Create request on page load
    useEffect(() => {
        const createRequest = async () => {
            if (!telegramId) return
            try {
                const response = await fetch('/api/request/choose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegramId,
                        username: username || 'Unknown',
                        currentStep: 'condition',
                    }),
                })
                if (response.ok) {
                    loadSavedConditions()
                }
            } catch (error) {
                console.error('Error creating request:', error)
            }
        }
        createRequest()
    }, [telegramId, username, loadSavedConditions])

    // Load conditions from sessionStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedInSession = sessionStorage.getItem('deviceConditions')
            if (savedInSession) {
                try {
                    const parsed = JSON.parse(savedInSession) as DeviceConditions
                    setDeviceConditions(parsed)
                    setHasChanges(true)
                    setLoadedFromDB(true)
                } catch (e) {
                    console.error('Ошибка при парсинге sessionStorage:', e)
                    sessionStorage.removeItem('deviceConditions')
                }
            } else {
                setLoadedFromDB(true)
            }
        }
    }, [setDeviceConditions])

    const handleSurfaceChange = (surface: SurfaceKey) => {
        setActiveSurface(surface)
        setHasUserInteracted(true)
    }

    const handleConditionSelect = (type: SurfaceKey, conditionId: string) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }
        setHasUserInteracted(true)
        const conditionText = getConditionText(conditionId)
        if (deviceConditions[type] !== conditionText) {
            const newConditions = { ...deviceConditions, [type]: conditionText }
            setDeviceConditions(newConditions)
            setIsEditing(false)
            setIsAllSelected(false)
            setHasChanges(true)
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('deviceConditions', JSON.stringify(newConditions))
            }
            saveConditionsToDatabase(newConditions)
        }
    }

    const handleContinue = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('basePrice', JSON.stringify(basePrice))
        }
        setShowDialog(false)
        router.push('/request/additional-condition')
    }

    const handleEdit = () => {
        setShowDialog(false)
        setHasChanges(false)
    }

    const getConditionText = (conditionId: string): string => {
        if (conditionId.includes('_new')) return 'Новый'
        if (conditionId.includes('_have_scratches')) return 'Заметные царапины'
        if (conditionId.includes('_scratches')) return 'Трещины'
        if (conditionId.includes('display_front') || conditionId.includes('display_back') || conditionId.includes('display_side'))
            return 'Очень хорошее'
        return conditionId // Fallback
    }

    const calculateTotalPenalty = (conditions: DeviceConditions): number => {
        let totalPenalty = 0
        if (conditions.front) {
            if (conditions.front === 'Новый') totalPenalty += 0
            else if (conditions.front === 'Очень хорошее') totalPenalty += -3
            else if (conditions.front === 'Заметные царапины') totalPenalty += -8
            else if (conditions.front === 'Трещины') totalPenalty += -15
        }
        if (conditions.back) {
            if (conditions.back === 'Новый') totalPenalty += 0
            else if (conditions.back === 'Очень хорошее') totalPenalty += -3
            else if (conditions.back === 'Заметные царапины') totalPenalty += -8
            else if (conditions.back === 'Трещины') totalPenalty += -15
        }
        if (conditions.side) {
            if (conditions.side === 'Новый') totalPenalty += 0
            else if (conditions.side === 'Очень хорошее') totalPenalty += -3
            else if (conditions.side === 'Заметные царапины') totalPenalty += -8
            else if (conditions.side === 'Трещины') totalPenalty += -15
        }
        return totalPenalty
    }

    const calculateFinalPrice = (basePrice: number, conditions: DeviceConditions): number => {
        let totalPenalty = calculateTotalPenalty(conditions)
        if (totalPenalty < -50) totalPenalty = -50
        const finalPrice = basePrice * (1 + totalPenalty / 100)
        const minPrice = basePrice * 0.5
        return Math.max(finalPrice, minPrice)
    }

    const steps = ['IMEI и S/N', 'Выбор модели', 'Состояние устройства', 'Дополнительные функции', 'Подтверждение']
    const getCurrentStep = () => 3 // Step 3 for condition page
    const preloadImages = getConditionImages()

    if (!loadedFromDB) {
        return (
            <Page back={true}>
                <div className="flex min-h-screen items-center justify-center bg-slate-50">
                    <p className="text-slate-500">Загрузка...</p>
                </div>
            </Page>
        )
    }

    return (
        <Page back={true}>
            <ImagePreloader images={preloadImages} />
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-12 md:px-8">
                    <div className="mb-6">
                        <ProgressBar currentStep={getCurrentStep()} totalSteps={5} steps={steps} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mb-8 space-y-3 text-center md:text-left"
                    >
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Оценка состояния</span>
                        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                            Как выглядит ваш iPhone сегодня
                        </h1>
                        <p className="text-sm text-slate-500 md:text-base">
                            Оцените состояние устройства, чтобы получить точную стоимость
                        </p>
                    </motion.div>

                    <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                        <div className="grid grid-cols-1 gap-4 lg:w-[280px]">
                            {SURFACE_ORDER.map((surface) => {
                                const option = getOptionByLabel(surface, deviceConditions[surface])
                                const isActive = activeSurface === surface
                                const isComplete = Boolean(option)
                                return (
                                    <button
                                        key={surface}
                                        type="button"
                                        onClick={() => handleSurfaceChange(surface)}
                                        className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${isActive
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.6)]'
                                            : 'border-white/70 bg-white/70 text-slate-900 shadow-sm hover:border-slate-200 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <span
                                                    className={`text-[10px] uppercase tracking-[0.25em] ${isActive ? 'text-white/70' : 'text-slate-400'
                                                        }`}
                                                >
                                                    {SURFACE_META[surface].accent}
                                                </span>
                                                <p className="mt-1 text-sm font-medium">{SURFACE_META[surface].title}</p>
                                            </div>
                                            <span
                                                className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${isComplete
                                                    ? isActive
                                                        ? 'border-white/40 bg-white/20 text-white'
                                                        : 'border-slate-200 bg-white text-slate-700'
                                                    : 'border-amber-200 bg-amber-50 text-amber-600'
                                                    }`}
                                            >
                                                {isComplete ? 'OK' : '!'}
                                            </span>
                                        </div>
                                        <p
                                            className={`mt-3 text-xs leading-5 ${isActive ? 'text-white/80' : 'text-slate-500'
                                                }`}
                                        >
                                            {option ? getConditionText(option.id) : 'Не выбрано'}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex-1 space-y-6">
                            <motion.div
                                key={activeSurface}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                                            {SURFACE_META[activeSurface].accent}
                                        </span>
                                        <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                                            {SURFACE_META[activeSurface].title}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">{SURFACE_META[activeSurface].subtitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 p-1 shadow-sm">
                                        {SURFACE_ORDER.map((surface) => {
                                            const isActiveTab = activeSurface === surface
                                            const completed = Boolean(deviceConditions[surface])
                                            return (
                                                <button
                                                    key={`${surface}-tab`}
                                                    type="button"
                                                    onClick={() => handleSurfaceChange(surface)}
                                                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${isActiveTab
                                                        ? 'bg-slate-900 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.55)]'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                        }`}
                                                >
                                                    <span>{SURFACE_META[surface].accent}</span>
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${completed
                                                            ? isActiveTab
                                                                ? 'bg-emerald-300'
                                                                : 'bg-emerald-500/70'
                                                            : 'bg-amber-400'
                                                            }`}
                                                    />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:items-end">
                                    <div className="relative flex w-full justify-center md:w-1/2">
                                        {previewImage ? (
                                            <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-inner">
                                                <Image
                                                    src={previewImage}
                                                    alt={currentSelection ? getConditionText(currentSelection.id) : 'Состояние устройства'}
                                                    width={320}
                                                    height={560}
                                                    priority={activeSurface === 'front'}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[9/16] w-full max-w-[260px] rounded-[32px] border border-dashed border-slate-300 bg-white/60" />
                                        )}
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-inner backdrop-blur">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Состояние</p>
                                            <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                                {currentSelection ? getConditionText(currentSelection.id) : 'Не выбрано'}
                                            </h3>
                                            <p className="mt-3 text-sm text-slate-500">
                                                {currentSelection?.penalty === 0
                                                    ? 'Без изменений в цене'
                                                    : `Снижение цены: ${currentSelection?.penalty}%`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {currentOptions.map((option) => {
                                    const optionLabel = getConditionText(option.id)
                                    const isSelected = deviceConditions[activeSurface] === optionLabel
                                    const penaltyLabel = option.penalty === 0 ? '0%' : `${option.penalty}%`
                                    const imageSrc = getPictureUrl(`${option.image}.png`)
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleConditionSelect(activeSurface, option.id)}
                                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${isSelected
                                                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.55)]'
                                                : 'border-white/70 bg-white text-slate-900 shadow-sm hover:border-slate-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="relative flex flex-col items-center gap-3 px-3 py-4">
                                                <div
                                                    className={`relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border transition ${isSelected ? 'border-white/30 bg-white/10' : 'border-slate-200 bg-slate-100'
                                                        }`}
                                                >
                                                    <Image
                                                        src={imageSrc}
                                                        alt={optionLabel}
                                                        width={200}
                                                        height={200}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <span
                                                        className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                                                            }`}
                                                    >
                                                        {penaltyLabel}
                                                    </span>
                                                </div>
                                                <div className="text-center">
                                                    <p
                                                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-900'
                                                            }`}
                                                    >
                                                        {optionLabel}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 border-t border-white/70 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Итоговая оценка</p>
                            <div className="mt-2 flex items-baseline gap-3">
                                <span className="text-2xl font-semibold text-slate-900">
                                    {totalPenalty > 0 ? `+${totalPenalty}%` : `${totalPenalty}%`}
                                </span>
                                {estimatedPrice ? (
                                    <span className="text-sm text-slate-500">{priceFormatter.format(estimatedPrice)}</span>
                                ) : null}
                            </div>
                            {basePrice && estimatedPrice ? (
                                <p className="mt-2 text-xs text-slate-500">
                                    Базовая цена: {priceFormatter.format(basePrice)}
                                </p>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            disabled={!isReadyToContinue}
                            onClick={() => setShowDialog(true)}
                            className="h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none md:w-auto md:px-10"
                        >
                            Продолжить
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-center text-2xl font-semibold text-slate-900">
                            Подтверждение оценки
                        </DialogTitle>
                        <p className="text-center text-sm text-slate-500">
                            Проверьте выбранные состояния устройства
                        </p>
                    </DialogHeader>
                    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
                        {SURFACE_ORDER.map((surface) => {
                            const option = getOptionByLabel(surface, deviceConditions[surface])
                            return (
                                <div key={`${surface}-review`} className="flex items-center justify-between gap-3">
                                    <span className="font-medium text-slate-500">{SURFACE_META[surface].title}</span>
                                    <span className="text-slate-900">
                                        {option ? getConditionText(option.id) : 'Не выбрано'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    {estimatedPrice && basePrice ? (
                        <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm">
                            <span className="text-slate-500">Итоговая цена</span>
                            <span className="font-semibold text-slate-900">
                                {priceFormatter.format(estimatedPrice)}
                            </span>
                        </div>
                    ) : null}
                    <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 flex-1 rounded-full border-slate-200 text-slate-700"
                            onClick={handleEdit}
                        >
                            Редактировать
                        </Button>
                        <Button
                            type="button"
                            className="h-11 flex-1 rounded-full bg-slate-900 text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.65)] transition hover:bg-slate-800"
                            onClick={handleContinue}
                        >
                            Подтвердить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    )
}