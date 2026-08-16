'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRepairStore } from '@/stores/repairStore'
import { useState } from 'react'

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
    const { setDeviceModel } = useRepairStore()
    const [selected, setSelected] = useState<string | null>(null)

    const handleSelect = (m: string) => {
        const model = m === 'Другая модель' ? 'iPhone (Другая)' : `iPhone ${m}`
        setSelected(m)
        setDeviceModel(model)
        setTimeout(() => router.push('/repair/issue'), 180)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 mb-4">
                <p className="text-sm text-muted">Выберите ваше устройство из списка</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-8">
                    {MODELS.map((m, idx) => (
                        <motion.button
                            key={m}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => handleSelect(m)}
                            className={`p-4 rounded-2xl text-sm font-semibold transition-all border-2 text-left ${
                                selected === m
                                    ? 'border-accent bg-accent/15 text-accent-deep scale-[0.97] shadow-md'
                                    : 'border-border bg-surface-elevated text-foreground hover:border-accent/50 active:scale-[0.97]'
                            }`}
                        >
                            {m}
                        </motion.button>
                    ))}
            </div>
        </div>
    )
}
