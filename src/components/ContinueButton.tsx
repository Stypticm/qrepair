/**
 * Универсальная кнопка "Продолжить" с состояниями загрузки
 * Принцип единой истины: все кнопки работают одинаково
 */

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  isNavigating?: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ContinueButton({
  onClick,
  disabled = false,
  isLoading = false,
  isNavigating = false,
  loadingText = 'Переходим...',
  children,
  className = '',
  delay = 0.5
}: ContinueButtonProps) {
  const isDisabled = disabled || isLoading || isNavigating
  const buttonText = isLoading || isNavigating ? loadingText : children

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 ${className}`}
      >
        {buttonText}
      </Button>
    </motion.div>
  )
}

// Специализированные варианты кнопок
export function EvaluationContinueButton(props: Omit<ContinueButtonProps, 'loadingText'>) {
  return (
    <ContinueButton
      {...props}
      loadingText="Переходим для проверки функций..."
    />
  )
}

export function FormContinueButton(props: Omit<ContinueButtonProps, 'loadingText'>) {
  return (
    <ContinueButton
      {...props}
      loadingText="Переходим к оценке..."
    />
  )
}

export function CourierContinueButton(props: Omit<ContinueButtonProps, 'loadingText'>) {
  return (
    <ContinueButton
      {...props}
      loadingText="Переходим к фото..."
    />
  )
}

export function PhotosContinueButton(props: Omit<ContinueButtonProps, 'loadingText'>) {
  return (
    <ContinueButton
      {...props}
      loadingText="Сохраняем..."
    />
  )
}

export function DeviceFunctionsContinueButton(props: Omit<ContinueButtonProps, 'loadingText'>) {
  return (
    <ContinueButton
      {...props}
      loadingText="Переходим к доставке..."
    />
  )
}
