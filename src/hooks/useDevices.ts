import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

type DeviceResponse = {
  id: number
  model: string
  variant: string
  storage: string
  color: string
  basePrice: number
}

// Функция для парсинга deviceData из БД (упрощенная версия)
const parseDeviceDataFromDB = (deviceData: any) => {
  if (!deviceData || typeof deviceData !== 'object')
    return null

  try {
    // Используем готовое поле apple/modelName: "iPhone XR"
    const appleModelName =
      deviceData['apple/modelName'] || ''

    // Парсим deviceName до квадратной скобки: "iPhone XR 128GB Black [A2105] [iPhone11,8]"
    const deviceName = deviceData.deviceName || ''
    const cleanDeviceName = deviceName.split(' [')[0] // "iPhone XR 128GB Black"

    if (!appleModelName && !cleanDeviceName) return null

    // Определяем модель и вариант из apple/modelName (приоритет)
    let model = ''
    let variant = ''

    if (appleModelName) {
      // "iPhone XR" → model: "XR", variant: ""
      // "iPhone 14 Pro" → model: "14", variant: "Pro"
      const appleMatch = appleModelName.match(
        /iPhone\s+(XR|XS|SE|\d+(?:\s+(Pro Max|Pro|mini|Plus))?)/i
      )
      if (appleMatch) {
        const modelVariant = appleMatch[1]
        if (modelVariant === 'XR') {
          model = 'XR'
          variant = ''
        } else if (modelVariant === 'XS') {
          model = 'XS'
          variant = ''
        } else if (modelVariant === 'SE') {
          model = 'SE'
          variant = ''
        } else {
          // Для моделей типа "14 Pro", "15 Pro Max"
          const modelMatch = modelVariant.match(
            /(\d+)(?:\s+(Pro Max|Pro|mini|Plus))?/
          )
          if (modelMatch) {
            model = modelMatch[1]
            variant = modelMatch[2] || ''
          }
        }
      }
    }

    // Если apple/modelName не дал результат, парсим cleanDeviceName
    if (!model && cleanDeviceName) {
      const deviceMatch = cleanDeviceName.match(
        /iPhone\s+(XR|XS|SE|\d+(?:\s+(Pro Max|Pro|mini|Plus))?)/i
      )
      if (deviceMatch) {
        const modelVariant = deviceMatch[1]
        if (modelVariant === 'XR') {
          model = 'XR'
          variant = ''
        } else if (modelVariant === 'XS') {
          model = 'XS'
          variant = ''
        } else if (modelVariant === 'SE') {
          model = 'SE'
          variant = ''
        } else {
          const modelMatch = modelVariant.match(
            /(\d+)(?:\s+(Pro Max|Pro|mini|Plus))?/
          )
          if (modelMatch) {
            model = modelMatch[1]
            variant = modelMatch[2] || ''
          }
        }
      }
    }

    // Парсим память и цвет из cleanDeviceName
    const storageMatch = cleanDeviceName.match(/(\d+GB)/i)
    const storage = storageMatch ? storageMatch[1] : ''

    const colorMatch = cleanDeviceName.match(
      /(Black|White|Red|Blue|Purple|Green|Gold|Silver|Space Gray|Midnight|Starlight)/i
    )
    const extractedColor = colorMatch ? colorMatch[1] : ''

    // Маппинг цветов на коды БД
    const colorMap: { [key: string]: string } = {
      Black: 'Bl',
      White: 'Wh',
      Red: 'Re',
      Blue: 'Bl',
      Green: 'Gr',
      Purple: 'Pu',
      Yellow: 'Ye',
      Pink: 'Pi',
      Gold: 'Go',
      Silver: 'Wh',
      'Space Gray': 'Gr',
      Midnight: 'Bl',
      Starlight: 'Wh',
    }

    const color = colorMap[extractedColor] || 'Bl'

    return {
      model: model || null,
      variant: variant || null,
      storage: storage || null,
      color: color,
    }
  } catch (error) {
    console.warn('Ошибка при парсинге deviceData:', error)
    return null
  }
}

// Fallback функция для парсинга modelname (старая логика)
const parseModelNameFromDB = (modelname: string) => {
  if (!modelname || modelname === 'Модель не указана')
    return null

  // Примеры: "Apple iPhone XR 128GB Black", "iPhone 14 Pro 256GB Blue"
  const match = modelname.match(
    /iPhone\s+(XR|XS|SE|\d+(?:\s+(?:Pro|Pro Max|mini|Plus))?)\s+(\d+GB)\s+(\w+)/i
  )

  if (match) {
    const [, modelVariant, storage, color] = match

    // Парсим модель и вариант
    let model = ''
    let variant = ''

    if (modelVariant === 'XR') {
      model = 'XR'
      variant = ''
    } else if (modelVariant === 'XS') {
      model = 'XS'
      variant = ''
    } else if (modelVariant === 'SE') {
      model = 'SE'
      variant = ''
    } else {
      // Для моделей типа "14 Pro", "15 Pro Max"
      const modelMatch = modelVariant.match(
        /(\d+)(?:\s+(Pro Max|Pro|mini|Plus))?/
      )
      if (modelMatch) {
        model = modelMatch[1]
        variant = modelMatch[2] || ''
      }
    }

    // Маппинг цветов
    const colorMap: { [key: string]: string } = {
      Black: 'Bl',
      White: 'Wh',
      Red: 'Re',
      Blue: 'Bl',
      Green: 'Gr',
      Purple: 'Pu',
      Yellow: 'Ye',
      Pink: 'Pi',
      Gold: 'Go',
      Silver: 'Wh',
    }

    return {
      model: model || null,
      variant: variant || null,
      storage: storage || null,
      color: colorMap[color] || 'Bl',
    }
  }

  return null
}

const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      message || `Request failed: ${response.status}`
    )
  }
  return response.json()
}

const fetchModels = () =>
  fetchJSON<string[]>('/api/devices/models')

const fetchVariants = (model: string) =>
  fetchJSON<string[]>(
    `/api/devices/variants?model=${encodeURIComponent(
      model
    )}`
  )

const fetchStorages = (
  model: string,
  variant: string | null
) => {
  const params = new URLSearchParams({ model })
  if (variant !== null && variant !== undefined) {
    params.set('variant', variant)
  }
  return fetchJSON<string[]>(
    `/api/devices/storages?${params.toString()}`
  )
}

const fetchColors = (
  model: string,
  variant: string | null,
  storage: string | null
) => {
  const params = new URLSearchParams({ model })
  if (variant !== null && variant !== undefined) {
    params.set('variant', variant)
  }
  if (storage) {
    params.set('storage', storage)
  }
  return fetchJSON<string[]>(
    `/api/devices/colors?${params.toString()}`
  )
}

const fetchDevice = (
  model: string,
  variant: string | null,
  storage: string,
  color: string
) => {
  const params = new URLSearchParams({
    model,
    storage,
    color,
  })
  if (
    variant !== null &&
    variant !== undefined &&
    variant !== ''
  ) {
    params.set('variant', variant)
  }
  return fetchJSON<DeviceResponse>(
    `/api/devices/device?${params.toString()}`
  )
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

  useEffect(() => {
    console.log('useDevices: selectedOptions changed', selectedOptions);
  }, [selectedOptions]);

  // Восстанавливаем данные из sessionStorage при инициализации
  useEffect(() => {
    if (typeof window === 'undefined') return

    const restoreData = async () => {
      try {
        // Сначала проверяем sessionStorage
        const savedSelection = sessionStorage.getItem(
          'phoneSelection'
        )
        if (savedSelection) {
          const parsed = JSON.parse(savedSelection)
          console.log(
            '🔄 Восстанавливаем выбор из sessionStorage:',
            parsed
          )

          setSelectedOptions({
            model: parsed.model || null,
            variant: parsed.variant || null,
            storage: parsed.storage || null,
            color: parsed.color || null,
          })
          return
        }

        // Если нет данных в sessionStorage, пробуем получить из БД
        const telegramId =
          sessionStorage.getItem('telegramId') ||
          localStorage.getItem('telegramId')

        if (telegramId) {
          const response = await fetch(
            '/api/request/getDraft',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            const data = await response.json()

            // Сначала пробуем deviceData (приоритет)
            if (data?.deviceData) {
              const parsedModel = parseDeviceDataFromDB(
                data.deviceData
              )
              if (parsedModel) {
                console.log(
                  '🔄 Восстанавливаем выбор из deviceData:',
                  parsedModel
                )
                setSelectedOptions(parsedModel)
                return
              }
            }

            // Fallback на modelname если deviceData нет
            if (
              data?.modelname &&
              data.modelname !== 'Модель не указана'
            ) {
              // Парсим modelname из БД (старая логика)
              const parsedModel = parseModelNameFromDB(
                data.modelname
              )
              if (parsedModel) {
                console.log(
                  '🔄 Восстанавливаем выбор из modelname:',
                  parsedModel
                )
                setSelectedOptions(parsedModel)
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          'Ошибка при восстановлении выбора:',
          error
        )
      }
    }

    restoreData()
  }, [])

  const modelsQuery = useQuery<string[]>({
    queryKey: ['device-models'],
    queryFn: fetchModels,
    staleTime: Infinity,
  })

  const variantsQuery = useQuery<string[]>({
    queryKey: ['device-variants', selectedOptions.model],
    queryFn: () =>
      fetchVariants(selectedOptions.model as string),
    enabled: Boolean(selectedOptions.model),
    staleTime: Infinity,
  })

  const storagesQuery = useQuery<string[]>({
    queryKey: [
      'device-storages',
      selectedOptions.model,
      selectedOptions.variant ?? '',
    ],
    queryFn: () =>
      fetchStorages(
        selectedOptions.model as string,
        selectedOptions.variant
      ),
    // Загружаем память только если:
    // 1. Выбрана модель И
    // 2. Варианты загружены И
    // 3. (Вариантов нет ИЛИ выбран конкретный вариант)
    enabled: Boolean(
      selectedOptions.model &&
        variantsQuery.isSuccess &&
        (variantsQuery.data?.length <= 1 ||
          selectedOptions.variant !== null)
    ),
    staleTime: Infinity,
  })

  const colorsQuery = useQuery<string[]>({
    queryKey: [
      'device-colors',
      selectedOptions.model,
      selectedOptions.variant ?? '',
      selectedOptions.storage ?? '',
    ],
    queryFn: () =>
      fetchColors(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage
      ),
    // Загружаем цвета только если:
    // 1. Выбрана модель И
    // 2. Память загружена И
    // 3. Выбрана конкретная память
    enabled: Boolean(
      selectedOptions.model &&
        storagesQuery.isSuccess &&
        selectedOptions.storage !== null &&
        selectedOptions.storage !== undefined
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
      fetchDevice(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage as string,
        selectedOptions.color as string
      ),
    // Загружаем устройство только если:
    // 1. Выбрана модель И
    // 2. Цвета загружены И
    // 3. Выбраны конкретные память и цвет (не null)
    enabled: Boolean(
      selectedOptions.model &&
        colorsQuery.isSuccess &&
        selectedOptions.storage !== null &&
        selectedOptions.storage !== undefined &&
        selectedOptions.color !== null &&
        selectedOptions.color !== undefined
    ),
    staleTime: Infinity,
  })

  useEffect(() => {
    const variantList = variantsQuery.data ?? []
    if (!selectedOptions.model) return

    if (
      selectedOptions.variant !== null &&
      selectedOptions.variant !== undefined &&
      !variantList.includes(selectedOptions.variant)
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        variant: variantList[0] ?? null,
        storage: null,
        color: null,
      }))
      return
    }

    if (
      selectedOptions.variant === undefined &&
      variantList.length === 1
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        variant: variantList[0] ?? null,
      }))
    }
  }, [
    selectedOptions.model,
    selectedOptions.variant,
    variantsQuery.data,
  ])

  useEffect(() => {
    const storageList = storagesQuery.data ?? []
    if (!selectedOptions.model) return

    // Автоматически выбираем память только если есть ровно 1 вариант
    if (
      selectedOptions.storage === undefined &&
      storageList.length === 1
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        storage: storageList[0] ?? null,
      }))
      return
    }

    // Если выбранная память не существует в списке, выбираем первую доступную
    if (
      selectedOptions.storage !== null &&
      selectedOptions.storage !== undefined &&
      !storageList.includes(selectedOptions.storage) &&
      storageList.length > 0
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        storage: storageList[0] ?? null,
        color: null,
      }))
    }
  }, [
    selectedOptions.model,
    selectedOptions.variant,
    selectedOptions.storage,
    storagesQuery.data,
  ])

  useEffect(() => {
    const colorList = colorsQuery.data ?? []
    if (
      !selectedOptions.model ||
      selectedOptions.storage === undefined
    )
      return

    // Автоматически выбираем цвет только если есть ровно 1 вариант
    if (
      selectedOptions.color === undefined &&
      colorList.length === 1
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        color: colorList[0] ?? null,
      }))
      return
    }

    // Если выбранный цвет не существует в списке, выбираем первый доступный
    if (
      selectedOptions.color !== null &&
      selectedOptions.color !== undefined &&
      !colorList.includes(selectedOptions.color) &&
      colorList.length > 0
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        color: colorList[0] ?? null,
      }))
    }
  }, [
    selectedOptions.model,
    selectedOptions.storage,
    selectedOptions.color,
    colorsQuery.data,
  ])

  const handleOptionSelect = (
    type: keyof typeof selectedOptions,
    value: string | null
  ) => {
    console.log('useDevices: Starting option selection', { type, value });
    setSelectedOptions((prev) => {
      console.log('useDevices: Prev state', prev);
      const newOptions = { ...prev, [type]: value }

      // Reset dependent options только если они действительно изменились
      if (type === 'model') {
        // Сбрасываем только если модель действительно изменилась
        if (prev.model !== value) {
          newOptions.variant = null
          newOptions.storage = null
          newOptions.color = null
        }
      } else if (type === 'variant') {
        // Сбрасываем только если вариант действительно изменился
        if (prev.variant !== value) {
          newOptions.storage = null
          newOptions.color = null
        }
      } else if (type === 'storage') {
        // Сбрасываем только если память действительно изменилась
        if (prev.storage !== value) {
          newOptions.color = null
        }
      }

      // Сохраняем выбор в sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            'phoneSelection',
            JSON.stringify(newOptions)
          )
          console.log(
            '💾 Сохранён выбор в sessionStorage:',
            newOptions
          )
        } catch (error) {
          console.warn(
            'Ошибка при сохранении выбора:',
            error
          )
        }
      }

      return newOptions
    })
  }

  return {
    // Data
    models: modelsQuery.data ?? [],
    variants: variantsQuery.data ?? [],
    storages: storagesQuery.data ?? [],
    colors: colorsQuery.data ?? [],
    selectedDevice: deviceQuery.data ?? null,
    // State
    selectedOptions,
    // Actions
    handleOptionSelect,
    // Status
    isLoading:
      modelsQuery.isLoading ||
      variantsQuery.isLoading ||
      storagesQuery.isLoading ||
      colorsQuery.isLoading ||
      deviceQuery.isLoading,
    // Individual loading states
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
