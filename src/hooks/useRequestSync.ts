'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

interface RequestStatus {
  id: string
  status: string
  currentStep: string | null
  updatedAt: string
}

interface StatusResponse {
  success: boolean
  exists: boolean
  request?: RequestStatus
  message?: string
}

export const useRequestSync = () => {
  const { telegramId, resetAllStates, setCurrentStep } =
    useAppStore()
  const router = useRouter()
  const lastCheckRef = useRef<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Страницы где не нужна синхронизация
  const skipSyncPages = [
    '/request/delivery-options',
    '/request/pickup-points',
    '/request/photos',
    '/admin/requests',
    '/admin/masters',
    '/admin/add-lot',
    '/admin/market-prices',
    '/admin/price-parsing',
    '/admin/telegram-id',
    '/request/evaluation-mode',
    '/master/points',
    '/master/requests',
    '/debug',
    '/test',
    '/internal',
    '/cart',
    '/favorites',
  ]

  const checkRequestStatus = useCallback(async () => {
    if (!telegramId) return

    // Пропускаем синхронизацию на определенных страницах
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (
        skipSyncPages.some((page) =>
          currentPath.includes(page)
        )
      ) {
        return
      }

      // Пропускаем синхронизацию если на странице формы и есть ошибка загрузки
      if (currentPath.includes('/request/form')) {
        const hasError = document.querySelector(
          '[data-error="device-not-found"]'
        )
        if (hasError) {
          console.log(
            '🔄 Пропускаем синхронизацию из-за ошибки на странице формы'
          )
          return
        }
      }
    }

    try {
      const response = await fetch(
        '/api/request/checkStatus',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegramId }),
        }
      )

      if (!response.ok) return

      const data: StatusResponse = await response.json()

      if (!data.success) return

      // Если заявка не существует, но у нас есть данные в store
      if (!data.exists) {
        console.log(
          '🔄 Request deleted by admin, clearing local state'
        )

        // Очищаем все локальные данные
        resetAllStates()

        // Очищаем sessionStorage
        if (typeof window !== 'undefined') {
          const tgId = sessionStorage.getItem('telegramId')
          const tgUsername = sessionStorage.getItem(
            'telegramUsername'
          )
          sessionStorage.clear()
          if (tgId)
            sessionStorage.setItem('telegramId', tgId)
          if (tgUsername)
            sessionStorage.setItem(
              'telegramUsername',
              tgUsername
            )
        }

        // Редиректим на главную
        router.replace('/')
        return
      }

      // Если заявка существует, обновляем currentStep
      if (data.request && data.request.currentStep) {
        const currentStep = data.request.currentStep
        const lastStep = lastCheckRef.current

        // Если шаг изменился, обновляем store
        if (lastStep !== currentStep) {
          console.log(
            '🔄 Step changed from',
            lastStep,
            'to',
            currentStep
          )
          setCurrentStep(currentStep)
          lastCheckRef.current = currentStep
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error)
    }
  }, [telegramId, resetAllStates, setCurrentStep, router])

  const startSync = useCallback(() => {
    if (intervalRef.current) return

    // Проверяем сразу
    checkRequestStatus()

    // Увеличиваем интервал до 30 секунд для экономии ресурсов
    // Проверяем только когда пользователь активен
    intervalRef.current = setInterval(() => {
      // Проверяем только если страница видима
      if (document.visibilityState === 'visible') {
        checkRequestStatus()
      }
    }, 30000) // 30 секунд вместо 5
  }, [checkRequestStatus])

  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (telegramId) {
      startSync()
    } else {
      stopSync()
    }

    return () => stopSync()
  }, [telegramId, startSync, stopSync])

  return {
    checkRequestStatus,
    startSync,
    stopSync,
  }
}
