'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

// Определяем порядок шагов в процессе оценки
const stepOrder: string[] = [
  '/', // Главная страница или начальная точка
  '/request/device-info',
  '/request/form',
  '/request/evaluation',
  '/request/device-functions',
  '/request/delivery-options',
  '/request/photos',
  '/request/final',
]

export const useStepNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()

  const goBack = useCallback(() => {
    // Override for cases when user skipped form and came from device-info
    try {
      if (
        typeof window !== 'undefined' &&
        pathname === '/request/evaluation'
      ) {
        const override = window.sessionStorage.getItem(
          'previousStepPath'
        )
        if (override) {
          window.sessionStorage.removeItem(
            'previousStepPath'
          )
          router.push(override)
          return
        }
      }
    } catch {}

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
