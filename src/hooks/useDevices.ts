import { useState, useEffect, useCallback } from 'react'

export interface Device {
  id: string
  model: string
  variant: string
  storage: string
  color: string
  country: string
  simType: string
  basePrice: number
}

export interface DeviceFilters {
  model?: string
  variant?: string
  storage?: string
  color?: string
  country?: string
  simType?: string
}

export interface UseDevicesReturn {
  // Данные
  models: string[]
  variants: string[]
  storages: string[]
  colors: string[]
  countries: string[]
  simTypes: string[]
  selectedDevice: Device | null

  // Состояние загрузки
  loading: {
    models: boolean
    variants: boolean
    storages: boolean
    colors: boolean
    countries: boolean
    simTypes: boolean
    device: boolean
  }

  // Методы
  loadModels: () => Promise<void>
  loadVariants: (model: string) => Promise<void>
  loadStorages: (
    filters: Pick<DeviceFilters, 'model' | 'variant'>
  ) => Promise<void>
  loadColors: (
    filters: Pick<
      DeviceFilters,
      'model' | 'variant' | 'storage'
    >
  ) => Promise<void>
  loadCountries: (
    filters: Pick<
      DeviceFilters,
      'model' | 'variant' | 'storage' | 'color'
    >
  ) => Promise<void>
  loadSimTypes: (
    filters: Pick<
      DeviceFilters,
      'model' | 'variant' | 'storage' | 'color' | 'country'
    >
  ) => Promise<void>
  loadDevice: (filters: DeviceFilters) => Promise<void>
  clearFilters: () => void
}

export function useDevices(): UseDevicesReturn {
  const [models, setModels] = useState<string[]>([])
  const [variants, setVariants] = useState<string[]>([])
  const [storages, setStorages] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [simTypes, setSimTypes] = useState<string[]>([])
  const [selectedDevice, setSelectedDevice] =
    useState<Device | null>(null)

  const [loading, setLoading] = useState({
    models: false,
    variants: false,
    storages: false,
    colors: false,
    countries: false,
    simTypes: false,
    device: false,
  })

  // Загрузка моделей
  const loadModels = useCallback(async () => {
    setLoading((prev) => ({ ...prev, models: true }))
    try {
      const response = await fetch('/api/devices/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Error loading models:', error)
    } finally {
      setLoading((prev) => ({ ...prev, models: false }))
    }
  }, [])

  // Загрузка вариантов
  const loadVariants = useCallback(
    async (model: string) => {
      if (!model) return

      setLoading((prev) => ({ ...prev, variants: true }))
      try {
        const startTime = Date.now()
        const response = await fetch(
          `/api/devices/variants?model=${encodeURIComponent(
            model
          )}`
        )
        const data = await response.json()
        const endTime = Date.now()
        if (data.success) {
          setVariants(data.variants)
        }
      } catch (error) {
        console.error('Error loading variants:', error)
      } finally {
        setLoading((prev) => ({ ...prev, variants: false }))
      }
    },
    []
  )

  // Загрузка объемов памяти
  const loadStorages = useCallback(
    async (
      filters: Pick<DeviceFilters, 'model' | 'variant'>
    ) => {
      if (!filters.model) return

      setLoading((prev) => ({ ...prev, storages: true }))
      try {
        const startTime = Date.now()
        const params = new URLSearchParams({
          model: filters.model,
        })
        if (filters.variant !== undefined)
          params.append('variant', filters.variant)

        const response = await fetch(
          `/api/devices/storages?${params}`
        )
        const data = await response.json()
        const endTime = Date.now()
        if (data.success) {
          setStorages(data.storages)
        }
      } catch (error) {
        console.error('Error loading storages:', error)
      } finally {
        setLoading((prev) => ({ ...prev, storages: false }))
      }
    },
    []
  )

  // Загрузка цветов
  const loadColors = useCallback(
    async (
      filters: Pick<
        DeviceFilters,
        'model' | 'variant' | 'storage'
      >
    ) => {
      if (!filters.model) return

      setLoading((prev) => ({ ...prev, colors: true }))
      try {
        const params = new URLSearchParams({
          model: filters.model,
        })
        if (filters.variant !== undefined)
          params.append('variant', filters.variant)
        if (filters.storage)
          params.append('storage', filters.storage)

        const response = await fetch(
          `/api/devices/colors?${params}`
        )
        const data = await response.json()
        if (data.success) {
          setColors(data.colors)
        } else {
          console.error('❌ Colors API error:', data.error)
        }
      } catch (error) {
        console.error('Error loading colors:', error)
      } finally {
        setLoading((prev) => ({ ...prev, colors: false }))
      }
    },
    []
  )

  // Загрузка стран
  const loadCountries = useCallback(
    async (
      filters: Pick<
        DeviceFilters,
        | 'model'
        | 'variant'
        | 'storage'
        | 'color'
        | 'simType'
      >
    ) => {
      if (!filters.model) return

      setLoading((prev) => ({ ...prev, countries: true }))
      try {
        const params = new URLSearchParams({
          model: filters.model,
        })
        if (filters.variant !== undefined)
          params.append('variant', filters.variant)
        if (filters.storage)
          params.append('storage', filters.storage)
        if (filters.color)
          params.append('color', filters.color)
        if (filters.simType)
          params.append('simType', filters.simType)

        const response = await fetch(
          `/api/devices/countries?${params}`
        )
        const data = await response.json()
        if (data.success) {
          setCountries(data.countries)
        } else {
          console.error(
            '❌ Countries API error:',
            data.error
          )
        }
      } catch (error) {
        console.error('Error loading countries:', error)
      } finally {
        setLoading((prev) => ({
          ...prev,
          countries: false,
        }))
      }
    },
    []
  )

  // Загрузка типов SIM
  const loadSimTypes = useCallback(
    async (
      filters: Pick<
        DeviceFilters,
        'model' | 'variant' | 'storage' | 'color'
      >
    ) => {
      if (!filters.model) return

      setLoading((prev) => ({ ...prev, simTypes: true }))
      try {
        const params = new URLSearchParams({
          model: filters.model,
        })
        if (filters.variant !== undefined)
          params.append('variant', filters.variant)
        if (filters.storage)
          params.append('storage', filters.storage)
        if (filters.color)
          params.append('color', filters.color)

        const response = await fetch(
          `/api/devices/sim-types?${params}`
        )
        const data = await response.json()
        if (data.success) {
          setSimTypes(data.simTypes)
        } else {
          console.error(
            '❌ Sim types API error:',
            data.error
          )
        }
      } catch (error) {
        console.error('Error loading sim types:', error)
      } finally {
        setLoading((prev) => ({ ...prev, simTypes: false }))
      }
    },
    []
  )

  // Загрузка конкретного устройства
  const loadDevice = useCallback(
    async (filters: DeviceFilters) => {
      console.log(
        '🔍 loadDevice called with filters:',
        filters
      )

      if (!filters.model) {
        console.log('🔍 loadDevice - no model, returning')
        return
      }

      setLoading((prev) => ({ ...prev, device: true }))
      try {
        const params = new URLSearchParams({
          model: filters.model,
        })
        if (filters.variant)
          params.append('variant', filters.variant)
        if (filters.storage)
          params.append('storage', filters.storage)
        if (filters.color)
          params.append('color', filters.color)
        if (filters.country)
          params.append('country', filters.country)
        if (filters.simType)
          params.append('simType', filters.simType)

        console.log(
          '🔍 loadDevice - fetching with params:',
          params.toString()
        )

        const response = await fetch(
          `/api/devices/price?${params}`
        )
        const data = await response.json()
        console.log('🔍 loadDevice - response data:', data)

        if (data.success) {
          console.log(
            '🔍 loadDevice - API response data:',
            data
          )
          // API возвращает devices (массив), берем первый элемент
          const device =
            data.devices && data.devices.length > 0
              ? data.devices[0]
              : null
          console.log(
            '🔍 loadDevice - setting selectedDevice:',
            device
          )
          setSelectedDevice(device)
        } else {
          console.log(
            '🔍 loadDevice - API returned success: false'
          )
        }
      } catch (error) {
        console.error('Error loading device:', error)
      } finally {
        setLoading((prev) => ({ ...prev, device: false }))
      }
    },
    []
  )

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setVariants([])
    setStorages([])
    setColors([])
    setCountries([])
    setSimTypes([])
    setSelectedDevice(null)
  }, [])

  // Автоматическая загрузка моделей при инициализации
  useEffect(() => {
    loadModels()
  }, [loadModels])

  return {
    models,
    variants,
    storages,
    colors,
    countries,
    simTypes,
    selectedDevice,
    loading,
    loadModels,
    loadVariants,
    loadStorages,
    loadColors,
    loadCountries,
    loadSimTypes,
    loadDevice,
    clearFilters,
  }
}
