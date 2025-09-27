import { useState, useCallback } from 'react'

export interface Device {
  id: number
  model: string
  variant: string
  storage: string
  color: string
  basePrice: number
}

export const useDevices = () => {
  const [models, setModels] = useState<string[]>([])
  const [variants, setVariants] = useState<string[]>([])
  const [storages, setStorages] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [selectedDevice, setSelectedDevice] =
    useState<Device | null>(null)
  const [loading, setLoading] = useState({
    models: false,
    variants: false,
    storages: false,
    colors: false,
    device: false,
  })
  const [error, setError] = useState<string | null>(null)

  const loadModels = useCallback(async () => {
    setLoading((prev) => ({ ...prev, models: true }))
    setError(null)
    try {
      const response = await fetch('/api/devices/models')
      if (!response.ok)
        throw new Error('Failed to fetch models')
      const data = await response.json()
      setModels(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading((prev) => ({ ...prev, models: false }))
    }
  }, [])

  const loadVariants = useCallback(
    async (model: string) => {
      setLoading((prev) => ({ ...prev, variants: true }))
      setError(null)
      setVariants([]) // Reset
      try {
        const response = await fetch(
          `/api/devices/variants?model=${model}`
        )
        if (!response.ok)
          throw new Error('Failed to fetch variants')
        const data = await response.json()
        setVariants(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading((prev) => ({ ...prev, variants: false }))
      }
    },
    []
  )

  const loadStorages = useCallback(
    async ({
      model,
      variant,
    }: {
      model: string
      variant: string | null
    }) => {
      setLoading((prev) => ({ ...prev, storages: true }))
      setError(null)
      setStorages([]) // Reset
      try {
        const response = await fetch(
          `/api/devices/storages?model=${model}&variant=${
            variant || ''
          }`
        )
        if (!response.ok)
          throw new Error('Failed to fetch storages')
        const data = await response.json()
        setStorages(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading((prev) => ({ ...prev, storages: false }))
      }
    },
    []
  )

  const loadColors = useCallback(
    async ({
      model,
      variant,
      storage,
    }: {
      model: string
      variant: string | null
      storage: string
    }) => {
      setLoading((prev) => ({ ...prev, colors: true }))
      setError(null)
      setColors([]) // Reset
      try {
        const response = await fetch(
          `/api/devices/colors?model=${model}&variant=${
            variant || ''
          }&storage=${storage}`
        )
        if (!response.ok)
          throw new Error('Failed to fetch colors')
        const data = await response.json()
        setColors(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading((prev) => ({ ...prev, colors: false }))
      }
    },
    []
  )

  const loadDevice = useCallback(
    async ({
      model,
      variant,
      storage,
      color,
    }: {
      model: string
      variant: string | null
      storage: string
      color: string
    }) => {
      setLoading((prev) => ({ ...prev, device: true }))
      setError(null)
      try {
        const response = await fetch(
          `/api/devices/device?model=${model}&variant=${
            variant || ''
          }&storage=${storage}&color=${color}`
        )
        if (!response.ok)
          throw new Error('Failed to fetch device')
        const data = await response.json()
        setSelectedDevice(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading((prev) => ({ ...prev, device: false }))
      }
    },
    []
  )

  const clearFilters = useCallback(() => {
    setVariants([])
    setStorages([])
    setColors([])
    setSelectedDevice(null)
  }, [])

  return {
    models,
    variants,
    storages,
    colors,
    countries,
    selectedDevice,
    loading,
    error,
    loadModels,
    loadVariants,
    loadStorages,
    loadColors,
    loadDevice,
    clearFilters,
  }
}
