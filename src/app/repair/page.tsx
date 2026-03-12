'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MonitorSmartphone, BatteryCharging, Camera, Cpu, Settings2, Smartphone, ChevronRight } from 'lucide-react'
import { useRepairStore } from '@/stores/repairStore'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

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
  const { setCategory, setSelectedIssues, selectedIssues, reset } = useRepairStore()

  // Сброс хранилища при входе на главную
  useEffect(() => {
    reset()
  }, [reset])

  const toggleIssue = (name: string) => {
    if (selectedIssues.includes(name)) {
      setSelectedIssues(selectedIssues.filter((n) => n !== name))
    } else {
      setSelectedIssues([...selectedIssues, name])
    }
  }

  const handleContinue = () => {
    if (!selectedIssues.length) return
    // Сохраняем все выбранные поломки в одном поле
    setCategory(selectedIssues.join(', '))
    router.push('/repair/device')
  }

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
      <div className="text-center space-y-2 mb-6 mt-2">
        <p className="text-sm text-gray-500">Выберите одну или несколько проблем для предварительной оценки</p>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat, idx) => {
            const isActive = selectedIssues.includes(cat.name)
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleIssue(cat.name)}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all active:scale-[0.98] gap-3 ${
                  isActive
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
              >
                <div className={`p-4 rounded-full ${cat.bg} ${cat.color}`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
                  {cat.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
        <Button
          disabled={!selectedIssues.length}
          onClick={handleContinue}
          className="w-full h-14 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 disabled:opacity-40 disabled:shadow-none"
        >
          Продолжить
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
