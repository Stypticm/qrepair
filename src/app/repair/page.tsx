'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MonitorSmartphone, BatteryCharging, Camera, Cpu, Settings2, Smartphone } from 'lucide-react'
import { useRepairStore } from '@/stores/repairStore'
import { useEffect } from 'react'

const CATEGORIES = [
  { id: 'screen', name: 'Разбито стекло / экран', icon: MonitorSmartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'battery', name: 'Быстро садится АКБ', icon: BatteryCharging, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'camera', name: 'Не работает камера', icon: Camera, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'board', name: 'Не включается', icon: Cpu, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'body', name: 'Разбит корпус', icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'diagnostics', name: 'Сложная поломка', icon: Settings2, color: 'text-gray-500', bg: 'bg-gray-50' },
]

export default function RepairCategoriesPage() {
  const router = useRouter()
  const { setCategory, reset } = useRepairStore()

  // Сброс хранилища при входе на главную
  useEffect(() => {
    reset()
  }, [reset])

  const handleSelect = (categoryId: string) => {
    setCategory(categoryId)
    router.push('/repair/device')
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6 mt-2">
        <p className="text-sm text-gray-500">Выберите тип проблемы для предварительной оценки</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(cat.name)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98] gap-3"
          >
            <div className={`p-4 rounded-full ${cat.bg} ${cat.color}`}>
              <cat.icon className="w-8 h-8" />
            </div>
            <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
              {cat.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
