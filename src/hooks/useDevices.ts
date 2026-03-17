import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { deviceService } from '@/services/deviceService'

type DeviceResponse = {
  id: number
  model: string
  variant: string
  storage: string
  color: string
  basePrice: number
}

export const useDevices = () => {
  const [selectedOptions, setSelectedOptions] = useState<{
    model: string | null
    variant: string | null
    storage: string | null
    color: string | null
  }>({
    model: null,
    variant: null,
    storage: null,
    color: null,
  })

  // Восстанавливаем данные из sessionStorage при инициализации
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedSelection = sessionStorage.getItem('phoneSelection')
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection)
        setSelectedOptions({
          model: parsed.model || null,
          variant: parsed.variant || null,
          storage: parsed.storage || null,
          color: parsed.color || null,
        })
      } catch (e) {
        console.warn('Failed to parse phoneSelection from sessionStorage')
      }
    }
  }, [])

  // Queries
  const modelsQuery = useQuery({
    queryKey: ['device-models'],
    queryFn: deviceService.fetchModels,
    staleTime: Infinity,
  })

  const variantsQuery = useQuery({
    queryKey: ['device-variants', selectedOptions.model],
    queryFn: () => deviceService.fetchVariants(selectedOptions.model as string),
    enabled: Boolean(selectedOptions.model),
    staleTime: Infinity,
  })

  const storagesQuery = useQuery({
    queryKey: [
      'device-storages',
      selectedOptions.model,
      selectedOptions.variant ?? '',
    ],
    queryFn: () =>
      deviceService.fetchStorages(
        selectedOptions.model as string,
        selectedOptions.variant
      ),
    enabled: Boolean(
      selectedOptions.model &&
        variantsQuery.isSuccess &&
        (variantsQuery.data?.length <= 1 || selectedOptions.variant !== null)
    ),
    staleTime: Infinity,
  })

  const colorsQuery = useQuery({
    queryKey: [
      'device-colors',
      selectedOptions.model,
      selectedOptions.variant ?? '',
      selectedOptions.storage ?? '',
    ],
    queryFn: () =>
      deviceService.fetchColors(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage
      ),
    enabled: Boolean(
      selectedOptions.model &&
        storagesQuery.isSuccess &&
        selectedOptions.storage !== null
    ),
    staleTime: Infinity,
  })

  const deviceQuery = useQuery<DeviceResponse>({
    queryKey: [
      'device-detail',
      selectedOptions.model,
      selectedOptions.variant ?? '',
      selectedOptions.storage ?? '',
      selectedOptions.color ?? '',
    ],
    queryFn: () =>
      deviceService.fetchDevice(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage as string,
        selectedOptions.color as string
      ),
    enabled: Boolean(
      selectedOptions.model &&
        colorsQuery.isSuccess &&
        selectedOptions.storage !== null &&
        selectedOptions.color !== null
    ),
    staleTime: Infinity,
  })

  // Авто-выбор единственных вариантов (Business Logic)
  // Объединяем в один эффект для предотвращения цепочек перерисовок
  useEffect(() => {
    if (!selectedOptions.model) return

    const variantList = variantsQuery.data ?? []
    const storageList = storagesQuery.data ?? []
    const colorList = colorsQuery.data ?? []

    setSelectedOptions(prev => {
      let needsUpdate = false
      const newOptions = { ...prev }

      // 1. Обработка вариантов
      if (variantsQuery.isSuccess && newOptions.variant === null && variantList.length === 1) {
        newOptions.variant = variantList[0]
        needsUpdate = true
      }

      // 2. Обработка памяти
      if (storagesQuery.isSuccess && newOptions.storage === null && storageList.length === 1) {
        newOptions.storage = storageList[0]
        needsUpdate = true
      }

      // 3. Обработка цветов
      if (colorsQuery.isSuccess && newOptions.color === null && colorList.length === 1) {
        newOptions.color = colorList[0]
        needsUpdate = true
      }

      return needsUpdate ? newOptions : prev
    })
  }, [
    variantsQuery.isSuccess,
    storagesQuery.isSuccess,
    colorsQuery.isSuccess,
    variantsQuery.data,
    storagesQuery.data,
    colorsQuery.data,
  ])

  const handleOptionSelect = useCallback((
    type: keyof typeof selectedOptions,
    value: string | null
  ) => {
    setSelectedOptions((prev) => {
      if (prev[type] === value) return prev

      const newOptions = { ...prev, [type]: value }

      // Атомарный сброс зависимых полей (SRP + Predictability)
      if (type === 'model') {
        newOptions.variant = null
        newOptions.storage = null
        newOptions.color = null
      } else if (type === 'variant') {
        newOptions.storage = null
        newOptions.color = null
      } else if (type === 'storage') {
        newOptions.color = null
      }

      // Сохранение (Side Effect вынесен в колбэк)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('phoneSelection', JSON.stringify(newOptions))
      }

      return newOptions
    })
  }, [])

  return {
    models: modelsQuery.data ?? [],
    variants: variantsQuery.data ?? [],
    storages: storagesQuery.data ?? [],
    colors: colorsQuery.data ?? [],
    selectedDevice: deviceQuery.data ?? null,
    selectedOptions,
    handleOptionSelect,
    isLoading:
      modelsQuery.isLoading ||
      variantsQuery.isLoading ||
      storagesQuery.isLoading ||
      colorsQuery.isLoading ||
      deviceQuery.isLoading,
    isLoadingVariants: variantsQuery.isLoading,
    isLoadingStorages: storagesQuery.isLoading,
    isLoadingColors: colorsQuery.isLoading,
    error:
      modelsQuery.error ||
      variantsQuery.error ||
      storagesQuery.error ||
      colorsQuery.error ||
      deviceQuery.error,
  }
}
