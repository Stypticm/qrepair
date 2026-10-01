'use client'

import { useRouter } from 'next/navigation'
import { Cpu, BatteryCharging, Camera, Smartphone, MonitorSmartphone, Settings2 } from 'lucide-react'
import { useRepairStore } from '@/stores/repairStore'
import { useEffect, useState } from 'react'

const CATEGORIES = [
  { id: 'screen', name: 'Разбито стекло / экран', icon: MonitorSmartphone, color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100/80 dark:bg-sky-400/15', accent: 'border-sky-400 bg-sky-50/80 dark:bg-sky-400/20' },
  { id: 'battery', name: 'Быстро садится АКБ', icon: BatteryCharging, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100/80 dark:bg-emerald-400/15', accent: 'border-emerald-400 bg-emerald-50/80 dark:bg-emerald-400/20' },
  { id: 'camera', name: 'Не работает камера', icon: Camera, color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100/80 dark:bg-violet-400/15', accent: 'border-violet-400 bg-violet-50/80 dark:bg-violet-400/20' },
  { id: 'board', name: 'Не включается', icon: Cpu, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100/80 dark:bg-rose-400/15', accent: 'border-rose-400 bg-rose-50/80 dark:bg-rose-400/20' },
  { id: 'body', name: 'Разбит корпус', icon: Smartphone, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100/80 dark:bg-amber-400/15', accent: 'border-amber-400 bg-amber-50/80 dark:bg-amber-400/20' },
  { id: 'diagnostics', name: 'Сложная поломка', icon: Settings2, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100/80 dark:bg-slate-400/15', accent: 'border-slate-400 bg-slate-50/80 dark:bg-slate-400/20' },
]

export default function RepairCategoriesPage() {
  const router = useRouter()
  const { setCategory, reset } = useRepairStore()
  const [selected, setSelected] = useState<string | null>(null)

  // Сброс хранилища при входе на главную
  useEffect(() => {
    reset()
  }, [reset])

  const handleSelect = (name: string, id: string) => {
    setSelected(id)
    setCategory(name)
    // Небольшая задержка, чтобы пользователь увидел подсветку
    setTimeout(() => router.push('/repair/device'), 180)
  }

  return (
    <div className="flex flex-col gap-6 pb-20 touch-pan-y" style={{ touchAction: 'pan-y' }}>
      <div className="text-center space-y-1.5">
        <p className="text-sm text-muted">Выберите проблему для предварительной оценки</p>
      </div>

      <div className="grid grid-cols-2 gap-3 touch-pan-y" style={{ touchAction: 'pan-y' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.name, cat.id)}
              style={{ touchAction: 'pan-y' }}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all gap-2.5 active:scale-[0.97] touch-pan-y select-none cursor-pointer ${
                isSelected
                  ? `${cat.accent} scale-[0.97] shadow-lg`
                  : 'bg-surface-elevated border-border shadow-sm hover:shadow-md hover:border-accent/50'
              }`}
            >
              <div className={`p-4 rounded-full pointer-events-none ${cat.bg} ${cat.color}`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center leading-tight pointer-events-none">
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
