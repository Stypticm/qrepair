'use client'

import { useState, useEffect, useCallback } from 'react'

interface ImageCacheState {
  loaded: Set<string>
  loading: Set<string>
  errors: Set<string>
}

// Глобальный кэш изображений
let globalImageCache: ImageCacheState = {
  loaded: new Set(),
  loading: new Set(),
  errors: new Set(),
}

export function useImageCache() {
  const [cache, setCache] = useState<ImageCacheState>(
    globalImageCache
  )

  const preloadImage = useCallback(
    (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        // Если уже загружено, возвращаем true
        if (globalImageCache.loaded.has(src)) {
          resolve(true)
          return
        }

        // Если уже загружается, ждем
        if (globalImageCache.loading.has(src)) {
          const checkLoaded = () => {
            if (globalImageCache.loaded.has(src)) {
              resolve(true)
            } else if (globalImageCache.errors.has(src)) {
              resolve(false)
            } else {
              setTimeout(checkLoaded, 100)
            }
          }
          checkLoaded()
          return
        }

        // Начинаем загрузку
        globalImageCache.loading.add(src)
        setCache({ ...globalImageCache })

        const img = new Image()

        img.onload = () => {
          globalImageCache.loaded.add(src)
          globalImageCache.loading.delete(src)
          setCache({ ...globalImageCache })
          resolve(true)
        }

        img.onerror = () => {
          globalImageCache.errors.add(src)
          globalImageCache.loading.delete(src)
          setCache({ ...globalImageCache })
          resolve(false)
        }

        img.src = src
      })
    },
    []
  )

  const isImageLoaded = useCallback(
    (src: string): boolean => {
      return globalImageCache.loaded.has(src)
    },
    []
  )

  const isImageLoading = useCallback(
    (src: string): boolean => {
      return globalImageCache.loading.has(src)
    },
    []
  )

  const hasImageError = useCallback(
    (src: string): boolean => {
      return globalImageCache.errors.has(src)
    },
    []
  )

  const clearCache = useCallback(() => {
    globalImageCache = {
      loaded: new Set(),
      loading: new Set(),
      errors: new Set(),
    }
    setCache(globalImageCache)
  }, [])

  return {
    cache,
    preloadImage,
    isImageLoaded,
    isImageLoading,
    hasImageError,
    clearCache,
  }
}
