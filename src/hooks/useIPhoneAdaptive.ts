'use client'

import { useState, useEffect, useMemo } from 'react'

// iPhone-специфичные размеры экранов (принцип 80/20)
export const IPHONE_BREAKPOINTS = {
  SE: { width: 375, height: 667 }, // iPhone SE
  MINI: { width: 375, height: 812 }, // iPhone 12/13 mini
  STANDARD: { width: 390, height: 844 }, // iPhone 12/13/14
  PRO: { width: 393, height: 852 }, // iPhone 14 Pro
  PLUS: { width: 428, height: 926 }, // iPhone 12/13/14 Plus/Pro Max
} as const

export type IPhoneScreenSize =
  keyof typeof IPHONE_BREAKPOINTS

// Адаптивные размеры для iPhone (20% логики дают 80% результата)
export interface IPhoneAdaptiveSizes {
  // Размеры изображений
  imageSize: number
  bannerHeight: number

  // Размеры контейнеров
  cardPadding: string
  buttonHeight: string
  inputHeight: string

  // Размеры текста
  titleSize: string
  bodySize: string
  captionSize: string

  // Отступы
  sectionSpacing: string
  elementSpacing: string

  // Максимальные высоты для модальных окон
  modalMaxHeight: string
  dialogMaxHeight: string
}

// Функция для определения размера экрана iPhone
export const getIPhoneScreenSize = (): IPhoneScreenSize => {
  if (typeof window === 'undefined') return 'STANDARD'

  const { innerWidth, innerHeight } = window

  // Определяем по ширине экрана (приоритет) и высоте
  if (innerWidth <= 375) {
    return innerHeight <= 700 ? 'SE' : 'MINI'
  }
  if (innerWidth <= 390) return 'STANDARD'
  if (innerWidth <= 393) return 'PRO'
  return 'PLUS'
}

// Генерация адаптивных размеров для конкретного iPhone
export const getAdaptiveSizes = (
  screenSize: IPhoneScreenSize
): IPhoneAdaptiveSizes => {
  const breakpoint = IPHONE_BREAKPOINTS[screenSize]

  switch (screenSize) {
    case 'SE':
      return {
        imageSize: 80,
        bannerHeight: 200,
        cardPadding: 'p-3',
        buttonHeight: 'h-10',
        inputHeight: 'h-9',
        titleSize: 'text-lg',
        bodySize: 'text-sm',
        captionSize: 'text-xs',
        sectionSpacing: 'space-y-3',
        elementSpacing: 'space-y-2',
        modalMaxHeight: 'max-h-[80vh]',
        dialogMaxHeight: 'max-h-[70vh]',
      }

    case 'MINI':
      return {
        imageSize: 90,
        bannerHeight: 220,
        cardPadding: 'p-3',
        buttonHeight: 'h-10',
        inputHeight: 'h-9',
        titleSize: 'text-lg',
        bodySize: 'text-sm',
        captionSize: 'text-xs',
        sectionSpacing: 'space-y-3',
        elementSpacing: 'space-y-2',
        modalMaxHeight: 'max-h-[85vh]',
        dialogMaxHeight: 'max-h-[75vh]',
      }

    case 'STANDARD':
      return {
        imageSize: 100,
        bannerHeight: 240,
        cardPadding: 'p-4',
        buttonHeight: 'h-11',
        inputHeight: 'h-10',
        titleSize: 'text-xl',
        bodySize: 'text-sm',
        captionSize: 'text-xs',
        sectionSpacing: 'space-y-4',
        elementSpacing: 'space-y-3',
        modalMaxHeight: 'max-h-[90vh]',
        dialogMaxHeight: 'max-h-[80vh]',
      }

    case 'PRO':
      return {
        imageSize: 110,
        bannerHeight: 260,
        cardPadding: 'p-4',
        buttonHeight: 'h-11',
        inputHeight: 'h-10',
        titleSize: 'text-xl',
        bodySize: 'text-sm',
        captionSize: 'text-xs',
        sectionSpacing: 'space-y-4',
        elementSpacing: 'space-y-3',
        modalMaxHeight: 'max-h-[90vh]',
        dialogMaxHeight: 'max-h-[80vh]',
      }

    case 'PLUS':
      return {
        imageSize: 120,
        bannerHeight: 280,
        cardPadding: 'p-5',
        buttonHeight: 'h-12',
        inputHeight: 'h-11',
        titleSize: 'text-2xl',
        bodySize: 'text-base',
        captionSize: 'text-sm',
        sectionSpacing: 'space-y-5',
        elementSpacing: 'space-y-4',
        modalMaxHeight: 'max-h-[95vh]',
        dialogMaxHeight: 'max-h-[85vh]',
      }

    default:
      return getAdaptiveSizes('STANDARD')
  }
}

// Основной хук для iPhone-адаптивности
export function useIPhoneAdaptive() {
  const [screenSize, setScreenSize] =
    useState<IPhoneScreenSize>('STANDARD')
  const [isTelegramWebApp, setIsTelegramWebApp] =
    useState(false)
  const [viewportHeight, setViewportHeight] = useState(844)

  // Определяем размер экрана
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize(getIPhoneScreenSize())
      setViewportHeight(window.innerHeight)
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener(
      'orientationchange',
      updateScreenSize
    )

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener(
        'orientationchange',
        updateScreenSize
      )
    }
  }, [])

  // Определяем Telegram WebApp контекст
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInTelegram =
        window.Telegram?.WebApp !== undefined
      setIsTelegramWebApp(isInTelegram)

      if (
        isInTelegram &&
        window.Telegram?.WebApp?.viewportHeight
      ) {
        setViewportHeight(
          window.Telegram.WebApp.viewportHeight
        )
      }
    }
  }, [])

  // Мемоизированные адаптивные размеры
  const adaptiveSizes = useMemo(
    () => getAdaptiveSizes(screenSize),
    [screenSize]
  )

  // Дополнительные утилиты для Telegram WebApp
  const telegramUtils = useMemo(
    () => ({
      // Реальная высота экрана в Telegram WebApp
      realViewportHeight: viewportHeight,

      // Безопасная высота с учетом Telegram UI
      safeViewportHeight:
        viewportHeight - (isTelegramWebApp ? 60 : 0),

      // Адаптивный размер с учетом Telegram контекста
      getTelegramAdaptiveSize: (baseSize: number) => {
        if (!isTelegramWebApp) return baseSize
        return Math.round(baseSize * (viewportHeight / 844))
      },

      // CSS классы для Telegram WebApp
      telegramClasses: {
        container: isTelegramWebApp
          ? 'telegram-container'
          : '',
        fullscreen: isTelegramWebApp
          ? 'telegram-fullscreen'
          : '',
        safeArea: isTelegramWebApp
          ? 'telegram-safe-area'
          : '',
      },
    }),
    [viewportHeight, isTelegramWebApp]
  )

  return {
    screenSize,
    adaptiveSizes,
    isTelegramWebApp,
    viewportHeight,
    telegramUtils,

    // Утилиты для быстрого доступа
    isSmallScreen:
      screenSize === 'SE' || screenSize === 'MINI',
    isLargeScreen: screenSize === 'PLUS',
    isStandardScreen:
      screenSize === 'STANDARD' || screenSize === 'PRO',
  }
}

// Утилита для генерации CSS классов на основе iPhone размера
export const generateIPhoneClasses = (
  screenSize: IPhoneScreenSize,
  baseClasses: string = ''
) => {
  const sizes = getAdaptiveSizes(screenSize)

  return `${baseClasses} ${sizes.cardPadding} ${sizes.sectionSpacing}`.trim()
}

// Утилита для адаптивных размеров изображений
export const getAdaptiveImageSize = (
  screenSize: IPhoneScreenSize,
  baseSize: number = 100
) => {
  const sizes = getAdaptiveSizes(screenSize)
  return Math.round(baseSize * (sizes.imageSize / 100))
}
