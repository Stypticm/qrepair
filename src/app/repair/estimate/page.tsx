'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { ChevronRight, BrainCircuit, Wallet, AlertCircle } from 'lucide-react'

export default function RepairEstimatePage() {
    const router = useRouter()
    const { category, deviceModel } = useRepairStore()

    // Временная заглушка-оценка
    const estimateMin = category === 'Разбито стекло / экран' ? 4500 : 2500
    const estimateMax = category === 'Разбито стекло / экран' ? 12000 : 8000

    const handleNext = () => {
        router.push('/repair/delivery')
    }

    const handleAiDiagnosis = () => {
        router.push('/repair/ai-diagnosis')
    }

    return (
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mb-4 text-center">
                <p className="text-sm text-gray-500">
                    Ориентировочная стоимость ремонта для {deviceModel}
                </p>
            </div>

            <div className="flex-1 space-y-6 mt-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-2"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-full">
                            <Wallet className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                        Диапазон цен
                    </div>
                    <div className="text-3xl font-black text-gray-900">
                        {estimateMin.toLocaleString('ru-RU')} – {estimateMax.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="text-xs text-gray-400 mt-4 px-4 leading-relaxed">
                        *Точная стоимость будет определена после бесплатной диагностики мастером.
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={handleAiDiagnosis}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-3xl text-white text-left flex items-center justify-between shadow-lg shadow-purple-500/30 group hover:shadow-purple-500/50 transition-all active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20 group-hover:rotate-12 transition-transform">
                        <BrainCircuit className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 space-y-1">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5" />
                            AI Диагностика
                        </h3>
                        <p className="text-sm text-purple-100 opacity-90 max-w-[80%]">
                            Попробуйте новую функцию определения поломки с помощью ИИ
                        </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-purple-200 relative z-10" />
                </motion.button>

                <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Диагностика в нашем сервисном центре всегда <b>бесплатная</b>, даже если вы откажетесь от ремонта.
                    </p>
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    onClick={handleNext}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                >
                    К оформлению заявки
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
