'use client'

import { useRouter } from 'next/navigation'
import {
  Cpu,
  BatteryCharging,
  Camera,
  Smartphone,
  MonitorSmartphone,
  Settings2,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  {
    id: 'screen',
    name: 'Разбито стекло / экран',
    icon: MonitorSmartphone,
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-100/80 dark:bg-sky-400/15',
    border: 'border-sky-400',
  },
  {
    id: 'battery',
    name: 'Быстро садится АКБ',
    icon: BatteryCharging,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100/80 dark:bg-emerald-400/15',
    border: 'border-emerald-400',
  },
  {
    id: 'camera',
    name: 'Не работает камера',
    icon: Camera,
    color: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-100/80 dark:bg-violet-400/15',
    border: 'border-violet-400',
  },
  {
    id: 'board',
    name: 'Не включается',
    icon: Cpu,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100/80 dark:bg-rose-400/15',
    border: 'border-rose-400',
  },
  {
    id: 'body',
    name: 'Разбит корпус',
    icon: Smartphone,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100/80 dark:bg-amber-400/15',
    border: 'border-amber-400',
  },
  {
    id: 'diagnostics',
    name: 'Сложная поломка',
    icon: Settings2,
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100/80 dark:bg-slate-400/15',
    border: 'border-slate-400',
  },
]

export default function RepairCategoriesPage() {
  const router = useRouter()
  const { selectedIssues, toggleIssue } = useRepairStore()

  const handleNext = () => {
    if (selectedIssues.length > 0) {
      router.push('/repair/device')
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6 select-none">
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedIssues.includes(cat.name)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleIssue(cat.name)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2.5 active:scale-[0.97] cursor-pointer text-left',
                isSelected
                  ? 'border-accent bg-accent/15 dark:bg-accent/20 shadow-md ring-2 ring-accent/30'
                  : 'bg-surface-elevated border-border shadow-sm hover:shadow-md hover:border-accent/40'
              )}
            >
              {/* Бейдж выбранного элемента с галочкой */}
              <div
                className={cn(
                  'absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  isSelected
                    ? 'bg-accent text-primary-foreground shadow-sm scale-100'
                    : 'border border-border/60 bg-surface text-transparent scale-90'
                )}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              <div className={cn('p-3.5 rounded-2xl pointer-events-none transition-colors', cat.bg, cat.color)}>
                <cat.icon className="w-7 h-7" />
              </div>

              <span className="text-sm font-bold text-foreground text-center leading-tight pointer-events-none px-1">
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Кнопки навигации внизу */}
      <div className="flex gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          className="flex-1 h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
        >
          На главную
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={selectedIssues.length === 0}
          className="flex-[2] h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all disabled:opacity-40 cursor-pointer"
        >
          {selectedIssues.length > 0 ? (
            <>
              Далее ({selectedIssues.length})
              <ChevronRight className="w-5 h-5 ml-1.5" />
            </>
          ) : (
            'Выберите неисправность'
          )}
        </Button>
      </div>
    </div>
  )
}
