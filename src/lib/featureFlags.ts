// Система управления флагами функций
export type FeatureFlag =
  | 'NEW_UI'
  | 'BETA_FEATURES'
  | 'DEBUG_MODE'
  | 'ADVANCED_ANALYTICS'
  | 'NEW_PAYMENT_SYSTEM'

// Конфигурация флагов
export const FEATURE_FLAGS: Record<
  FeatureFlag,
  {
    enabled: boolean
    users: string[]
    description: string
  }
> = {
  NEW_UI: {
    enabled: true,
    users: ['1', '296925626', '531360988'],
    description: 'Новый интерфейс пользователя',
  },
  BETA_FEATURES: {
    enabled: true,
    users: ['1', '296925626', '531360988'],
    description: 'Бета-функции для тестирования',
  },
  DEBUG_MODE: {
    enabled: true,
    users: ['1', '296925626', '531360988'],
    description:
      'Режим отладки с дополнительной информацией',
  },
  ADVANCED_ANALYTICS: {
    enabled: false,
    users: ['1'],
    description: 'Расширенная аналитика',
  },
  NEW_PAYMENT_SYSTEM: {
    enabled: false,
    users: [],
    description: 'Новая система платежей',
  },
}

// Функция проверки флага
export const hasFeature = (
  feature: FeatureFlag,
  telegramId: string
): boolean => {
  const flag = FEATURE_FLAGS[feature]

  if (!flag.enabled) {
    return false
  }

  // Проверяем, есть ли пользователь в списке
  return flag.users.includes(telegramId)
}

// Функция получения всех активных флагов для пользователя
export const getActiveFeatures = (
  telegramId: string
): FeatureFlag[] => {
  return Object.keys(FEATURE_FLAGS).filter((feature) =>
    hasFeature(feature as FeatureFlag, telegramId)
  ) as FeatureFlag[]
}

// Функция для проверки, является ли пользователь тестером
export const isTester = (telegramId: string): boolean => {
  return hasFeature('BETA_FEATURES', telegramId)
}

// Функция для проверки, является ли пользователь админом
export const isAdmin = (telegramId: string): boolean => {
  return hasFeature('DEBUG_MODE', telegramId)
}
