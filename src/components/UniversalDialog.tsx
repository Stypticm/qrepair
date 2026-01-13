/**
 * Универсальное диалоговое окно с блокировкой до перехода
 * Принцип единой истины: все диалоги работают одинаково
 */

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export interface UniversalDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  children: React.ReactNode
  onContinue: () => void
  isLoading?: boolean
  isNavigating?: boolean
  continueText?: string
  loadingText?: string
  disabled?: boolean
}

export function UniversalDialog({
  open,
  onOpenChange,
  title,
  children,
  onContinue,
  isLoading = false,
  isNavigating = false,
  continueText = 'Продолжить',
  loadingText = 'Переходим...',
  disabled = false
}: UniversalDialogProps) {
  const isDisabled = disabled || isLoading || isNavigating
  const buttonText = isLoading || isNavigating ? loadingText : continueText

  // Блокируем закрытие диалога если идет загрузка или переход
  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading || isNavigating) {
      return // Не закрываем диалог
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg">
        <DialogTitle className="text-center text-lg font-semibold text-gray-900 mb-4">
          {title}
        </DialogTitle>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="pt-4"
        >
          <Button
            onClick={onContinue}
            disabled={isDisabled}
            className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {buttonText}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Специализированные диалоги
export function PriceRangeDialog({
  open,
  onOpenChange,
  onContinue,
  isLoading = false,
  isNavigating = false,
  priceRange
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onContinue: () => void
  isLoading?: boolean
  isNavigating?: boolean
  priceRange?: { min: number; max: number; midpoint: number }
}) {
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Итоговая оценка"
      onContinue={onContinue}
      isLoading={isLoading}
      isNavigating={isNavigating}
      continueText="Продолжить"
      loadingText="Переходим к доставке..."
    >
      {priceRange ? (
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              Диапазон оценки
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {priceRange.min.toLocaleString()} — {priceRange.max.toLocaleString()} ₽
            </div>
          </div>

          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
              style={{ 
                left: '0%', 
                width: '100%',
                background: `linear-gradient(to right, 
                  #10b981 0%, 
                  #3b82f6 50%, 
                  #f59e0b 100%)`
              }}
            />
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 rounded-full" />
            <div className="absolute top-0 right-0 w-1 h-full bg-slate-900 rounded-full" />
          </div>
          
          <div className="text-sm text-slate-600">
            Средняя цена: <span className="font-semibold text-slate-900">{priceRange.midpoint.toLocaleString()} ₽</span>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-slate-900">
            Рассчитываем цену...
          </div>
          <div className="text-sm text-slate-600">
            Пожалуйста, подождите
          </div>
        </div>
      )}
    </UniversalDialog>
  )
}
