'use client'

import { useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const IPHONE_SERIES: Record<string, string[]> = {
  'iPhone 17': ['17 Pro Max', '17 Pro', '17 Plus', '17'],
  'iPhone 16': ['16 Pro Max', '16 Pro', '16 Plus', '16'],
  'iPhone 15': ['15 Pro Max', '15 Pro', '15 Plus', '15'],
  'iPhone 14': ['14 Pro Max', '14 Pro', '14 Plus', '14'],
  'iPhone 13': ['13 Pro Max', '13 Pro', '13 mini', '13'],
  'iPhone 12': ['12 Pro Max', '12 Pro', '12 mini', '12'],
  'iPhone 11': ['11 Pro Max', '11 Pro', '11'],
  'Другие': ['XS Max', 'XS', 'XR', 'X', 'SE (3rd gen)', 'SE (2nd gen)', 'Другая модель'],
}

export default function RepairDevicePage() {
  const router = useRouter()
  const { series, setSeries, deviceModel, setDeviceModel } = useRepairStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  const seriesList = Object.keys(IPHONE_SERIES)
  const activeSeries = series || seriesList[0]
  const models = IPHONE_SERIES[activeSeries] ?? []

  const handleSeriesSelect = (s: string) => {
    setSeries(s)
  }

  const handleModelSelect = (m: string) => {
    const formatted = m === 'Другая модель' ? 'iPhone (Другая)' : `iPhone ${m}`
    setDeviceModel(formatted)
  }

  const handleNext = () => {
    if (deviceModel) {
      router.push('/repair/issue')
    }
  }

  const handleBack = () => {
    router.push('/repair')
  }

  // Pointer-based drag scroll (works in Telegram WebApp without blocking Telegram swipes)
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const delta = startX.current - e.clientX;
    scrollRef.current.scrollLeft = scrollStart.current + delta;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="space-y-6 pb-6 select-none">
      {/* Горизонтальный скролл серий табов */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-black text-muted uppercase tracking-widest">
            Серия
          </p>
          <span className="text-[10px] text-muted/70 font-medium">
            ← листайте серии →
          </span>
        </div>

        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex gap-2 pb-2 w-full overflow-x-auto select-none cursor-grab active:cursor-grabbing horizontal-scroll"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {seriesList.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSeriesSelect(s)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer active:scale-95 pointer-events-auto',
                activeSeries === s
                  ? 'bg-accent text-primary-foreground border-accent shadow-md'
                  : 'bg-surface-elevated border-border text-muted hover:border-accent/40 hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка моделей выбранной серии */}
      <div>
        <p className="text-[11px] font-black text-muted uppercase tracking-widest mb-2.5">
          Модель ({activeSeries})
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {models.map((m) => {
            const formatted = m === 'Другая модель' ? 'iPhone (Другая)' : `iPhone ${m}`
            const isSelected = deviceModel === formatted

            return (
              <button
                key={m}
                type="button"
                onClick={() => handleModelSelect(m)}
                className={cn(
                  'relative p-4 rounded-2xl text-sm font-bold transition-all border-2 text-left active:scale-[0.97] cursor-pointer flex items-center justify-between',
                  isSelected
                    ? 'border-accent bg-accent/15 dark:bg-accent/20 text-accent-deep dark:text-accent shadow-md ring-2 ring-accent/30'
                    : 'border-border bg-surface-elevated text-foreground hover:border-accent/40 hover:bg-surface'
                )}
              >
                <span className="truncate pr-1">{m}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-accent text-primary-foreground flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Кнопки навигации внизу формы */}
      <div className="flex gap-2.5 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1 h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Назад
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!deviceModel}
          className="flex-[2] h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all disabled:opacity-40 cursor-pointer"
        >
          {deviceModel ? (
            <>
              Далее ({deviceModel})
              <ChevronRight className="w-5 h-5 ml-1.5" />
            </>
          ) : (
            'Выберите модель'
          )}
        </Button>
      </div>
    </div>
  )
}
