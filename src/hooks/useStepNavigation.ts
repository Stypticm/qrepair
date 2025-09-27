'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

// Определяем порядок шагов в процессе оценки
const stepOrder: string[] = [
  '/', // Главная страница или начальная точка
  '/request/form',
  '/request/condition', // Это device-condition
  '/request/phone-condition',
  '/request/additional-condition',
  '/request/submit',
]

export const useStepNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()

  const goBack = useCallback(() => {
    const currentIndex = stepOrder.indexOf(pathname)

    // Если текущая страница найдена в списке и это не первая страница
    if (currentIndex > 0) {
      const previousStepPath = stepOrder[currentIndex - 1]
      router.push(previousStepPath)
    } else {
      // Если страница не найдена или это первый шаг, используем стандартное поведение
      router.back()
    }
  }, [pathname, router])

  return { goBack }
}
