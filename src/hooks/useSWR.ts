'use client'

import { useEffect, useRef, useState } from 'react'

type Fetcher<T> = (url: string) => Promise<T>

export default function useSWR<T = any>(
  key: string | null,
  fetcher: Fetcher<T>,
  options?: {
    revalidateOnFocus?: boolean
    keepPreviousData?: boolean
  }
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(!!key)
  const [isValidating, setIsValidating] =
    useState<boolean>(false)
  const keyRef = useRef<string | null>(key)

  const load = async (currentKey: string) => {
    try {
      if (!options?.keepPreviousData) setIsLoading(true)
      setIsValidating(true)
      const result = await fetcher(currentKey)
      setData(result)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }

  useEffect(() => {
    if (!key) return
    if (
      keyRef.current !== key ||
      !options?.keepPreviousData
    ) {
      keyRef.current = key
      load(key)
    }
  }, [key])

  useEffect(() => {
    if (!options?.revalidateOnFocus) return
    const onFocus = () => {
      if (keyRef.current) load(keyRef.current)
    }
    window.addEventListener('focus', onFocus)
    return () =>
      window.removeEventListener('focus', onFocus)
  }, [options?.revalidateOnFocus])

  const mutate = async (
    updater?: (current?: T) => T | undefined
  ) => {
    if (updater) {
      setData((prev) => updater(prev))
    }
    if (keyRef.current) {
      await load(keyRef.current)
    }
  }

  return { data, error, isLoading, mutate, isValidating }
}
