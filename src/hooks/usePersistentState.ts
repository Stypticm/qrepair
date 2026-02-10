'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useAppStore } from '@/stores/authStore'

interface PersistentStateOptions<T> {
  key: string
  defaultValue: T
  storage?: 'session' | 'cloud' | 'both'
  debounceMs?: number
  validate?: (value: any) => value is T
}

/**
 * Хук для управления состоянием с автоматическим сохранением
 * Приоритет: Zustand store → sessionStorage → CloudStorage → defaultValue
 */
export function usePersistentState<T>({
  key,
  defaultValue,
  storage = 'both',
  debounceMs = 500,
  validate,
}: PersistentStateOptions<T>) {
  const { telegramId } = useAppStore()
  const [state, setState] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Функция для сохранения в sessionStorage
  const saveToSession = useCallback(
    (value: T) => {
      if (typeof window === 'undefined') return

      try {
        sessionStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(
          `Failed to save to sessionStorage for key ${key}:`,
          error
        )
      }
    },
    [key]
  )

  // Функция для сохранения в CloudStorage
  const saveToCloud = useCallback(
    (value: T) => {
      if (typeof window === 'undefined') return

      try {
        const webApp = (window as any).Telegram?.WebApp
        const cloudStorage = webApp?.CloudStorage

        if (cloudStorage?.setItem && telegramId && webApp.isVersionAtLeast?.('6.9')) {
          cloudStorage.setItem(
            key,
            JSON.stringify(value),
            (error: any) => {
              if (error) {
                console.warn(
                  `Failed to save to CloudStorage for key ${key}:`,
                  error
                )
              }
            }
          )
        }
      } catch (error) {
        console.warn(
          `Failed to save to CloudStorage for key ${key}:`,
          error
        )
      }
    },
    [key, telegramId]
  )

  // Функция для загрузки из sessionStorage
  const loadFromSession = useCallback((): T | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = sessionStorage.getItem(key)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      return validate
        ? validate(parsed)
          ? parsed
          : null
        : parsed
    } catch (error) {
      console.warn(
        `Failed to load from sessionStorage for key ${key}:`,
        error
      )
      return null
    }
  }, [key, validate])

  // Функция для загрузки из CloudStorage
  const loadFromCloud =
    useCallback((): Promise<T | null> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve(null)
          return
        }

        try {
          const webApp = (window as any).Telegram?.WebApp
          const cloudStorage = webApp?.CloudStorage

          if (!cloudStorage?.getItem || !telegramId || !webApp.isVersionAtLeast?.('6.9')) {
            resolve(null)
            return
          }

          cloudStorage.getItem(
            key,
            (error: any, value: string | null) => {
              if (error || !value) {
                resolve(null)
                return
              }

              try {
                const parsed = JSON.parse(value)
                const result = validate
                  ? validate(parsed)
                    ? parsed
                    : null
                  : parsed
                resolve(result)
              } catch (parseError) {
                console.warn(
                  `Failed to parse CloudStorage value for key ${key}:`,
                  parseError
                )
                resolve(null)
              }
            }
          )
        } catch (error) {
          console.warn(
            `Failed to load from CloudStorage for key ${key}:`,
            error
          )
          resolve(null)
        }
      })
    }, [key, telegramId, validate])

  // Инициализация состояния при монтировании
  useEffect(() => {
    if (isInitializedRef.current) return

    const initializeState = async () => {
      setIsLoading(true)

      // 1. Пробуем загрузить из sessionStorage
      const sessionValue = loadFromSession()
      if (sessionValue !== null) {
        setState(sessionValue)
        setIsLoading(false)
        isInitializedRef.current = true
        return
      }

      // 2. Если в sessionStorage нет, пробуем CloudStorage
      if (storage === 'cloud' || storage === 'both') {
        const cloudValue = await loadFromCloud()
        if (cloudValue !== null) {
          setState(cloudValue)
          // Сохраняем в sessionStorage для быстрого доступа
          saveToSession(cloudValue)
        }
      }

      setIsLoading(false)
      isInitializedRef.current = true
    }

    initializeState()
  }, [
    loadFromSession,
    loadFromCloud,
    saveToSession,
    storage,
  ])

  // Автоматическое сохранение при изменении состояния
  useEffect(() => {
    if (!isInitializedRef.current) return

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Устанавливаем новый таймер для debounced сохранения
    timeoutRef.current = setTimeout(() => {
      if (storage === 'session' || storage === 'both') {
        saveToSession(state)
      }

      if (storage === 'cloud' || storage === 'both') {
        saveToCloud(state)
      }
    }, debounceMs)

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [
    state,
    saveToSession,
    saveToCloud,
    storage,
    debounceMs,
  ])

  // Функция для принудительного сохранения
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (storage === 'session' || storage === 'both') {
      saveToSession(state)
    }

    if (storage === 'cloud' || storage === 'both') {
      saveToCloud(state)
    }
  }, [state, saveToSession, saveToCloud, storage])

  // Функция для сброса состояния
  const reset = useCallback(() => {
    setState(defaultValue)

    // Очищаем хранилища
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(key)
      } catch (error) {
        console.warn(
          `Failed to remove from sessionStorage for key ${key}:`,
          error
        )
      }

      try {
        const webApp = (window as any).Telegram?.WebApp
        const cloudStorage = webApp?.CloudStorage
        if (cloudStorage?.removeItem) {
          cloudStorage.removeItem(key, () => {})
        }
      } catch (error) {
        console.warn(
          `Failed to remove from CloudStorage for key ${key}:`,
          error
        )
      }
    }
  }, [defaultValue, key])

  return {
    state,
    setState,
    isLoading,
    saveNow,
    reset,
  }
}

/**
 * Хук для работы с данными формы с автоматическим сохранением
 */
export function useFormData() {
  const { telegramId } = useAppStore()

  // Состояние выбора телефона
  const phoneSelection = usePersistentState({
    key: 'phoneSelection',
    defaultValue: {
      model: 'Apple iPhone 11',
      brand: 'Apple',
    },
    validate: (
      value
    ): value is { model: string; brand: string } =>
      value &&
      typeof value === 'object' &&
      typeof value.model === 'string' &&
      typeof value.brand === 'string',
  })

  // Состояние условий устройства
  const deviceConditions = usePersistentState({
    key: 'deviceConditions',
    defaultValue: {
      front: null,
      back: null,
      side: null,
      faceId: null,
      touchId: null,
      backCamera: null,
      battery: null,
    },
    validate: (value): value is any =>
      value && typeof value === 'object',
  })

  // Состояние оценки износа
  const wearValues = usePersistentState({
    key: 'evaluationWearValues',
    defaultValue: {
      display_front: 0,
      display_back: 0,
      back_camera: 0,
      battery: 0,
    },
    validate: (value): value is any =>
      value && typeof value === 'object',
  })

  // Дополнительные поля
  const imei = usePersistentState({
    key: 'imei',
    defaultValue: null as string | null,
    validate: (value): value is string | null =>
      value === null || typeof value === 'string',
  })

  const serialNumber = usePersistentState({
    key: 'serialNumber',
    defaultValue: null as string | null,
    validate: (value): value is string | null =>
      value === null || typeof value === 'string',
  })

  const price = usePersistentState({
    key: 'calculatedPrice',
    defaultValue: null as number | null,
    validate: (value): value is number | null =>
      value === null || typeof value === 'number',
  })

  const priceRange = usePersistentState({
    key: 'priceRange',
    defaultValue: null as {
      min: number
      max: number
      midpoint: number
    } | null,
    validate: (
      value
    ): value is {
      min: number
      max: number
      midpoint: number
    } | null =>
      value === null ||
      (value &&
        typeof value === 'object' &&
        typeof value.min === 'number' &&
        typeof value.max === 'number' &&
        typeof value.midpoint === 'number'),
  })

  // Функция для сохранения всех данных в БД
  const saveToDatabase = useCallback(async () => {
    if (!telegramId) return

    try {
      // Получаем существующий requestId из sessionStorage
      const existingRequestId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('currentRequestId')
          : null

      const response = await fetch(
        '/api/request/saveDraft',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            requestId: existingRequestId, // ✅ Передаем существующий ID
            modelname: phoneSelection.state.model,
            deviceConditions: deviceConditions.state,
            wearValues: wearValues.state,
            imei: imei.state,
            sn: serialNumber.state,
            price: price.state,
            priceRange: priceRange.state,
            currentStep: 'form', // или текущий шаг
          }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Данные сохранены в БД:', {
          requestId: result.requestId,
          currentStep: result.currentStep,
          isNewDraft: !existingRequestId,
        })

        // Сохраняем requestId для следующих обновлений
        if (
          result.requestId &&
          typeof window !== 'undefined'
        ) {
          sessionStorage.setItem(
            'currentRequestId',
            result.requestId
          )
          console.log(
            '💾 RequestId сохранен в sessionStorage:',
            result.requestId
          )
        }

        return result
      } else {
        const errorData = await response.json()
        console.error(
          '❌ Ошибка сохранения в БД:',
          errorData
        )
      }
    } catch (error) {
      console.error('Ошибка при сохранении в БД:', error)
    }
  }, [
    telegramId,
    phoneSelection.state,
    deviceConditions.state,
    wearValues.state,
    imei.state,
    serialNumber.state,
    price.state,
    priceRange.state,
  ])

  // Функция для сброса всех данных
  const resetAll = useCallback(() => {
    phoneSelection.reset()
    deviceConditions.reset()
    wearValues.reset()
    imei.reset()
    serialNumber.reset()
    price.reset()
    priceRange.reset()

    // Очищаем requestId из sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentRequestId')
      console.log('🗑️ RequestId очищен из sessionStorage')
    }
  }, [
    phoneSelection,
    deviceConditions,
    wearValues,
    imei,
    serialNumber,
    price,
    priceRange,
  ])

  return {
    phoneSelection,
    deviceConditions,
    wearValues,
    imei,
    serialNumber,
    price,
    priceRange,
    saveToDatabase,
    resetAll,
    isLoading:
      phoneSelection.isLoading ||
      deviceConditions.isLoading ||
      wearValues.isLoading,
  }
}
