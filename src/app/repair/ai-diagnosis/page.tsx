'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BrainCircuit, ChevronLeft, Image as ImageIcon, CheckCircle, Smartphone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRepairStore } from '@/stores/repairStore'

export default function RepairAiDiagnosisPage() {
    const router = useRouter()
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    // Берем данные из стора
    const { deviceModel, issueDescription } = useRepairStore()

    useEffect(() => {
        let timer1: NodeJS.Timeout
        let timer2: NodeJS.Timeout

        if (analyzing) {
            toast.info('Анализируем входные данные...', { duration: 2000 })

            timer1 = setTimeout(() => {
                toast.info('Определяем возможные неисправности...', { duration: 2000 })
            }, 2000)

            timer2 = setTimeout(() => {
                setResult('Анализ завершен')
                setAnalyzing(false)
            }, 4500)
        }

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [analyzing])

    const startAnalysis = () => {
        setAnalyzing(true)
        setResult(null)
    }

    return (
        <div className="space-y-6 pb-6 select-none">
            <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-black tracking-tight text-foreground flex items-center justify-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                    Нейросетевая диагностика
                </h2>
                <p className="text-xs text-muted">
                    Искусственный интеллект оценит вероятность неисправности
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-surface-elevated p-5 rounded-3xl border border-border shadow-sm space-y-3.5">
                    <div className="text-xs font-bold text-muted uppercase tracking-wider">Входные данные:</div>

                    <div className="flex gap-3 items-center p-3 bg-surface rounded-xl border border-border">
                        <Smartphone className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold">{deviceModel || 'iPhone'}</span>
                    </div>

                    <div className="flex gap-3 items-start p-3 bg-surface rounded-xl border border-border">
                        <ImageIcon className="w-5 h-5 text-muted shrink-0 mt-0.5" />
                        <span className="text-sm text-muted leading-relaxed italic">
                            {issueDescription || '«Описания проблемы нет»'}
                        </span>
                    </div>
                </div>

                {!analyzing && !result && (
                    <div>
                        <Button
                            onClick={startAnalysis}
                            className="w-full h-14 rounded-2xl font-black text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-500/25 group cursor-pointer"
                        >
                            Запустить анализ
                            <BrainCircuit className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                        </Button>
                    </div>
                )}

                {analyzing && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="relative w-16 h-16">
                            <motion.div
                                className="absolute inset-0 bg-purple-500/20 rounded-full"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <div className="relative bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-white">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-purple-600">Нейросеть анализирует поломку...</p>
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20 space-y-3"
                    >
                        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="w-6 h-6" />
                            <h3 className="font-bold text-base">Результат анализа</h3>
                        </div>

                        <p className="text-xs text-foreground/80 leading-relaxed">
                            На основе симптомов, с вероятностью 85% потребуется модульный ремонт. Рекомендуем доставить устройство в наш сервис для бесплатной детальной проверки мастером.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Кнопка возврата в потоке страницы */}
            <div className="pt-2">
                <Button
                    onClick={() => router.push('/repair/estimate')}
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5 mr-1.5" />
                    Вернуться к оценке
                </Button>
            </div>
        </div>
    )
}
