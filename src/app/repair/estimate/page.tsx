'use client'

import { useRouter } from 'next/navigation'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { ChevronRight, BrainCircuit, Wallet, AlertCircle, Wrench, Smartphone, ArrowLeft } from 'lucide-react'

export default function RepairEstimatePage() {
    const router = useRouter()
    const { category, selectedIssues, deviceModel } = useRepairStore()

    // Динамический расчёт оценки в зависимости от выбранных поломок
    const issues = selectedIssues.length > 0 ? selectedIssues : category ? [category] : []
    
    let baseMin = 2000
    let baseMax = 6000

    if (issues.length > 0) {
        let calcMin = 0
        let calcMax = 0

        issues.forEach((issue) => {
            if (issue.includes('Разбито стекло') || issue.includes('экран')) {
                calcMin += 4500
                calcMax += 12000
            } else if (issue.includes('АКБ') || issue.includes('садится')) {
                calcMin += 2500
                calcMax += 4500
            } else if (issue.includes('камера')) {
                calcMin += 3500
                calcMax += 8000
            } else if (issue.includes('Не включается') || issue.includes('плата')) {
                calcMin += 4000
                calcMax += 14000
            } else if (issue.includes('корпус')) {
                calcMin += 3000
                calcMax += 7000
            } else {
                calcMin += 2500
                calcMax += 6000
            }
        })

        baseMin = calcMin
        baseMax = calcMax
    }

    const handleNext = () => {
        router.push('/repair/delivery')
    }

    const handleAiDiagnosis = () => {
        router.push('/repair/ai-diagnosis')
    }

    return (
        <div className="space-y-6 pb-6 select-none">
            {/* Карточка устройства и выбранных неисправностей */}
            <div className="bg-surface-elevated p-4 rounded-2xl border border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-deep dark:text-accent flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted font-medium">Устройство</p>
                        <p className="text-sm font-bold text-foreground truncate">
                            {deviceModel || 'iPhone'}
                        </p>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface border border-border text-foreground/80">
                        {issues.length > 0 ? `${issues.length} неиспр.` : 'Диагностика'}
                    </span>
                </div>
            </div>

            {/* Выбранные поломки чипами */}
            {issues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {issues.map((issue, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-surface border border-border text-foreground/90"
                        >
                            <Wrench className="w-3 h-3 text-accent" />
                            {issue}
                        </span>
                    ))}
                </div>
            )}

            {/* Карточка с диапазоном цен */}
            <div className="bg-surface-elevated p-6 rounded-3xl border border-border shadow-sm text-center space-y-2">
                <div className="flex justify-center mb-2">
                    <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <Wallet className="w-8 h-8" />
                    </div>
                </div>
                <div className="text-xs font-bold text-muted uppercase tracking-widest">
                    Предварительный диапазон стоимости
                </div>
                <div className="text-3xl font-black text-foreground pt-1">
                    {baseMin.toLocaleString('ru-RU')} – {baseMax.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-muted mt-3 px-2 leading-relaxed">
                    *Точная смета будет определена после бесплатной диагностики мастером.
                </p>
            </div>

            {/* AI Диагностика (временно недоступна) */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/25 shadow-sm">
                <div className="p-5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 filter blur-[2.5px] opacity-60 select-none pointer-events-none flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-base font-bold flex items-center gap-2 text-purple-200">
                            <BrainCircuit className="w-5 h-5 text-purple-300" />
                            AI Диагностика
                        </h3>
                        <p className="text-xs text-purple-200/80 max-w-[85%] leading-relaxed">
                            Определите вероятную причину с помощью нейросети
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-300 shrink-0" />
                </div>
                {/* Оверлей: временно недоступна */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1.5px]">
                    <div className="px-3.5 py-1.5 rounded-full bg-surface-elevated/95 border border-border shadow-lg flex items-center gap-2 select-none">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-bold text-foreground">Временно недоступна</span>
                    </div>
                </div>
            </div>

            {/* Бесплатная диагностика инфобокс */}
            <div className="bg-amber-500/10 rounded-2xl p-4 flex gap-3 items-start border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    Диагностика в сервисном центре всегда <b>бесплатная</b>, даже при отказе от дальнейшего ремонта.
                </p>
            </div>

            {/* Кнопки навигации внизу */}
            <div className="flex gap-2.5 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/repair/issue')}
                    className="flex-1 h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Назад
                </Button>
                <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-[2] h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all cursor-pointer"
                >
                    К оформлению
                    <ChevronRight className="w-5 h-5 ml-1.5" />
                </Button>
            </div>
        </div>
    )
}
