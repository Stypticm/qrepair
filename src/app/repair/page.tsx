'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MonitorSmartphone, BatteryCharging, Camera, Cpu, Settings2, Smartphone, ChevronRight } from 'lucide-react'
import { useRepairStore } from '@/stores/repairStore'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'screen', name: 'Разбито стекло / экран', icon: MonitorSmartphone, color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100/80 dark:bg-sky-400/15' },
  { id: 'battery', name: 'Быстро садится АКБ', icon: BatteryCharging, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100/80 dark:bg-emerald-400/15' },
  { id: 'camera', name: 'Не работает камера', icon: Camera, color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100/80 dark:bg-violet-400/15' },
  { id: 'board', name: 'Не включается', icon: Cpu, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100/80 dark:bg-rose-400/15' },
  { id: 'body', name: 'Разбит корпус', icon: Smartphone, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100/80 dark:bg-amber-400/15' },
  { id: 'diagnostics', name: 'Сложная поломка', icon: Settings2, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100/80 dark:bg-slate-400/15' },
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
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2 mt-2">
        <p className="text-sm text-muted">Выберите одну или несколько проблем для предварительной оценки</p>
      </div>

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
                  ? 'bg-accent/15 border-accent shadow-md shadow-accent/10'
                  : 'bg-surface-elevated border-border shadow-sm hover:shadow-md hover:border-accent/50'
              }`}
            >
              <div className={`p-4 rounded-full ${cat.bg} ${cat.color}`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center leading-tight">
                {cat.name}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Кнопка после сетки, не перекрывает плитки */}
      <div className="pb-4">
        <Button
          disabled={!selectedIssues.length}
          onClick={handleContinue}
          className="w-full h-14 rounded-2xl font-bold text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/20 disabled:opacity-40 disabled:shadow-none"
        >
          Продолжить
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
