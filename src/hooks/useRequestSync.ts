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
    '/repair',    
    '/buyback',     
    '/admin',
  ]

  // Страницы где синхронизация должна быть более осторожной
  const carefulSyncPages = [
    '/request/device-info',
    '/request/form',
    '/request/evaluation',
    '/request/device-functions',
  ]

  const checkRequestStatus = useCallback(async () => {
    if (!telegramId) return

    // Пропускаем синхронизацию на определенных страницах
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname

      // Полностью пропускаем синхронизацию на этих страницах
      if (
        skipSyncPages.some((page) =>
          currentPath.includes(page)
        )
      ) {
        return
      }

      // Осторожная синхронизация на критических страницах
      if (
        carefulSyncPages.some((page) =>
          currentPath.includes(page)
        )
      ) {
        // Проверяем, есть ли активные диалоги или формы
        const hasActiveDialog = document.querySelector(
          '[role="dialog"]:not([aria-hidden="true"])'
        )
        const hasActiveForm = document.querySelector(
          'form:focus-within'
        )
        const hasActiveInput = document.querySelector(
          'input:focus, textarea:focus, select:focus'
        )

        if (
          hasActiveDialog ||
          hasActiveForm ||
          hasActiveInput
        ) {
          console.log(
            '🔄 Пропускаем синхронизацию - пользователь активно работает со страницей'
          )
          return
        }

        // На странице device-info дополнительная защита
        if (currentPath.includes('/request/device-info')) {
          const isChecking = document.querySelector(
            '[data-checking="true"]'
          )
          const isTransitioning = document.querySelector(
            '[data-transitioning="true"]'
          )
          const isActiveOnDeviceInfo =
            sessionStorage.getItem('activeOnDeviceInfo')

          if (
            isChecking ||
            isTransitioning ||
            isActiveOnDeviceInfo
          ) {
            console.log(
              '🔄 Пропускаем синхронизацию - идет проверка, переход или пользователь активно работает'
            )
            return
          }
        }
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
          // Дополнительная проверка для страницы device-info
          if (
            typeof window !== 'undefined' &&
            window.location.pathname.includes(
              '/request/device-info'
            )
          ) {
            // На странице device-info не меняем шаг, если пользователь активно работает
            const hasActiveDialog = document.querySelector(
              '[role="dialog"]:not([aria-hidden="true"])'
            )
            const hasActiveInput = document.querySelector(
              'input:focus, textarea:focus, select:focus'
            )
            const isChecking = document.querySelector(
              '[data-checking="true"]'
            )
            const isTransitioning = document.querySelector(
              '[data-transitioning="true"]'
            )
            const isActiveOnDeviceInfo =
              sessionStorage.getItem('activeOnDeviceInfo')

            if (
              hasActiveDialog ||
              hasActiveInput ||
              isChecking ||
              isTransitioning ||
              isActiveOnDeviceInfo
            ) {
              console.log(
                '🔄 Пропускаем изменение шага на device-info - пользователь активно работает'
              )
              return
            }
          }

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

    // Адаптивный интервал в зависимости от страницы
    const getInterval = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (
          carefulSyncPages.some((page) =>
            currentPath.includes(page)
          )
        ) {
          return 60000 // 1 минута для критических страниц
        }
      }
      return 30000 // 30 секунд для остальных
    }

    // Проверяем только когда пользователь активен
    intervalRef.current = setInterval(() => {
      // Проверяем только если страница видима
      if (document.visibilityState === 'visible') {
        checkRequestStatus()
      }
    }, getInterval())
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
