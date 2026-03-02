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

    // Берем данные из стора для заглушки
    const { deviceModel, issueDescription } = useRepairStore()

    useEffect(() => {
        // Симуляция "анализа" после входа на страницу
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
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mt-4 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                    AI Диагностика
                </h1>
                <p className="text-sm text-gray-500">
                    Искусственный интеллект проанализирует симптомы
                </p>
            </div>

            <div className="flex-1 space-y-6 mt-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="text-sm font-semibold text-gray-700">Входные данные:</div>

                    <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">{deviceModel || 'Устройство не выбрано'}</span>
                    </div>

                    <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 leading-relaxed italic">
                            {issueDescription || '«Описания проблемы нет»'}
                        </span>
                    </div>
                </div>

                {!analyzing && !result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Button
                            onClick={startAnalysis}
                            className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl shadow-purple-500/20 group"
                        >
                            Запустить анализ
                            <BrainCircuit className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                        </Button>
                    </motion.div>
                )}

                {analyzing && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                                <BrainCircuit className="w-8 h-8 text-white animate-pulse" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-purple-600 animate-pulse">Нейросеть работает...</p>
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 p-6 rounded-3xl border border-green-100 space-y-4"
                    >
                        <div className="flex items-center gap-3 text-green-700 mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Результат анализа</h3>
                        </div>

                        <p className="text-sm text-green-800 leading-relaxed">
                            На основе указанных симптомов, с вероятностью 85% потребуется замена модуля. Рекомендуется привезти устройство для бесплатной точной аппаратной диагностики.
                        </p>
                    </motion.div>
                )}
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-bold border-2 border-gray-200 bg-white/80 backdrop-blur-md hover:bg-gray-50 text-gray-700 transition-all active:scale-[0.98]"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Вернуться к оформлению
                </Button>
            </div>
        </div>
    )
}
