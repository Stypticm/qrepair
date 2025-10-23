/**
 * Централизованная система управления состоянием и персистентности
 * Принцип единой истины: все данные сохраняются и восстанавливаются единообразно
 */

import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/stores/authStore'

export interface PageState {
  [key: string]: any
}

export interface NavigationState {
  isLoading: boolean
  isNavigating: boolean
  isDialogOpen: boolean
  isDialogLocked: boolean
}

export interface PageConfig {
  step: string
  storageKey: string
  apiEndpoint?: string
  hasDialog?: boolean
  restoreOnMount?: boolean
}

// Конфигурация всех страниц в пути
export const PAGE_CONFIGS: Record<string, PageConfig> = {
  'device-info': {
    step: 'device-info',
    storageKey: 'deviceInfoData',
    apiEndpoint: '/api/request/device-info',
    restoreOnMount: true,
  },
  form: {
    step: 'form',
    storageKey: 'phoneSelection',
    restoreOnMount: true,
  },
  evaluation: {
    step: 'evaluation',
    storageKey: 'evaluationData',
    apiEndpoint: '/api/request/save-evaluation',
    restoreOnMount: true,
  },
  'device-functions': {
    step: 'device-functions',
    storageKey: 'deviceFunctionStates',
    hasDialog: true,
    restoreOnMount: true,
  },
  'delivery-options': {
    step: 'delivery-options',
    storageKey: 'deliveryOptionsData',
    restoreOnMount: true,
  },
  'pickup-points': {
    step: 'pickup-points',
    storageKey: 'pickupPointsData',
    restoreOnMount: true,
  },
  courier: {
    step: 'courier',
    storageKey: 'courierData',
    restoreOnMount: true,
  },
  'courier-booking': {
    step: 'courier-booking',
    storageKey: 'courierBookingData',
    restoreOnMount: true,
  },
  photos: {
    step: 'photos',
    storageKey: 'devicePhotos',
    restoreOnMount: true,
  },
  final: {
    step: 'final',
    storageKey: 'finalData',
    apiEndpoint: '/api/request/submit-final',
  },
}

export function usePageState<T extends PageState>(
  config: PageConfig,
  initialState: T
) {
  const { telegramId, setCurrentStep } = useAppStore()
  const [state, setState] = useState<T>(initialState)
  const [navigationState, setNavigationState] =
    useState<NavigationState>({
      isLoading: false,
      isNavigating: false,
      isDialogOpen: false,
      isDialogLocked: false,
    })

  // Восстановление состояния при монтировании
  useEffect(() => {
    if (!config.restoreOnMount) return

    try {
      const savedData = sessionStorage.getItem(
        config.storageKey
      )
      if (savedData) {
        const parsed = JSON.parse(savedData)
        console.log(
          `🔄 Восстанавливаем данные для ${config.step}:`,
          parsed
        )
        setState(parsed)
      }
    } catch (error) {
      console.warn(
        `Ошибка при восстановлении данных для ${config.step}:`,
        error
      )
      sessionStorage.removeItem(config.storageKey)
    }
  }, [config.storageKey, config.restoreOnMount])

  // Автоматическое сохранение при изменении состояния
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.setItem(
        config.storageKey,
        JSON.stringify(state)
      )
      console.log(
        `💾 Сохранены данные для ${config.step}:`,
        state
      )
    } catch (error) {
      console.warn(
        `Ошибка при сохранении данных для ${config.step}:`,
        error
      )
    }
  }, [state, config.storageKey])

  // Сохранение в БД через API
  const saveToDatabase = useCallback(
    async (data?: Partial<T>) => {
      if (!config.apiEndpoint || !telegramId) return

      try {
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            ...state,
            ...data,
            currentStep: config.step,
          }),
        })

        if (response.ok) {
          console.log(
            `✅ Данные сохранены в БД для ${config.step}`
          )
          return await response.json()
        } else {
          throw new Error(
            `HTTP error! status: ${response.status}`
          )
        }
      } catch (error) {
        console.error(
          `❌ Ошибка сохранения в БД для ${config.step}:`,
          error
        )
        throw error
      }
    },
    [config.apiEndpoint, config.step, telegramId, state]
  )

  // Универсальная функция продолжения
  const handleContinue = useCallback(
    async (
      nextPath: string,
      nextStep: string,
      options?: {
        saveToDb?: boolean
        showDialog?: boolean
        dialogData?: any
      }
    ) => {
      setNavigationState((prev) => ({
        ...prev,
        isLoading: true,
        isNavigating: true,
      }))

      try {
        // Сохраняем в БД если нужно
        if (options?.saveToDb) {
          await saveToDatabase(options.dialogData)
        }

        // Показываем диалог если нужно
        if (options?.showDialog && config.hasDialog) {
          setNavigationState((prev) => ({
            ...prev,
            isDialogOpen: true,
            isDialogLocked: true,
          }))
          return // Не переходим сразу, ждем закрытия диалога
        }

        // Переходим на следующую страницу
        setCurrentStep(nextStep)
        window.location.href = nextPath
      } catch (error) {
        console.error(
          `❌ Ошибка при переходе с ${config.step}:`,
          error
        )
        setNavigationState((prev) => ({
          ...prev,
          isLoading: false,
          isNavigating: false,
        }))
      }
    },
    [
      config.step,
      config.hasDialog,
      saveToDatabase,
      setCurrentStep,
    ]
  )

  // Обработка диалогового окна
  const handleDialogContinue = useCallback(
    async (
      nextPath: string,
      nextStep: string,
      dialogData?: any
    ) => {
      setNavigationState((prev) => ({
        ...prev,
        isLoading: true,
        isDialogLocked: true,
      }))

      try {
        // Сохраняем данные диалога
        if (dialogData) {
          await saveToDatabase(dialogData)
        }

        // Переходим на следующую страницу
        setCurrentStep(nextStep)
        window.location.href = nextPath
      } catch (error) {
        console.error(
          `❌ Ошибка при переходе из диалога ${config.step}:`,
          error
        )
        setNavigationState((prev) => ({
          ...prev,
          isLoading: false,
          isDialogLocked: false,
        }))
      }
    },
    [config.step, saveToDatabase, setCurrentStep]
  )

  // Обновление состояния
  const updateState = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Сброс состояния
  const resetState = useCallback(() => {
    setState(initialState)
    sessionStorage.removeItem(config.storageKey)
  }, [initialState, config.storageKey])

  return {
    state,
    setState: updateState,
    navigationState,
    setNavigationState,
    saveToDatabase,
    handleContinue,
    handleDialogContinue,
    resetState,
  }
}

// Хук для получения конфигурации страницы
export function usePageConfig(
  step: string
): PageConfig | null {
  return PAGE_CONFIGS[step] || null
}

// Утилита для очистки всех данных
export function clearAllPageData() {
  Object.values(PAGE_CONFIGS).forEach((config) => {
    sessionStorage.removeItem(config.storageKey)
  })
  console.log('🧹 Все данные страниц очищены')
}
