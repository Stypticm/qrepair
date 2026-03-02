'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

const MODELS = [
    "17 Pro Max", "17 Pro", "17 Plus", "17",
    "16 Pro Max", "16 Pro", "16 Plus", "16",
    "15 Pro Max", "15 Pro", "15 Plus", "15",
    "14 Pro Max", "14 Pro", "14 Plus", "14",
    "13 Pro Max", "13 Pro", "13 mini", "13",
    "12 Pro Max", "12 Pro", "12 mini", "12",
    "11 Pro Max", "11 Pro", "11",
    "Другая модель"
]

export default function RepairDevicePage() {
    const router = useRouter()
    const { deviceModel, setDeviceModel } = useRepairStore()

    const handleNext = () => {
        if (deviceModel) {
            router.push('/repair/issue')
        }
    }

    return (
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">Выберите ваше устройство из списка</p>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                <div className="grid grid-cols-2 gap-3">
                    {MODELS.map((m, idx) => (
                        <motion.button
                            key={m}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => setDeviceModel(m === "Другая модель" ? "iPhone (Другая)" : `iPhone ${m}`)}
                            className={`p-4 rounded-2xl text-sm font-semibold transition-all border-2 text-left ${deviceModel === `iPhone ${m}` || (m === "Другая модель" && deviceModel === "iPhone (Другая)")
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
                                }`}
                        >
                            {m}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    disabled={!deviceModel}
                    onClick={handleNext}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                >
                    Далее
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
