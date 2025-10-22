export interface DeviceFunction {
  key: string
  title: string
  description: string
  affectsPrice: boolean
  weight: number // вес влияния на цену (0-1)
  critical: boolean // критичная функция (если не работает - стоп)
  icon: string
}

export const DEVICE_FUNCTIONS: DeviceFunction[] = [
  {
    key: 'device_power',
    title: 'Включается ли телефон?',
    description: 'Устройство включается и загружается',
    affectsPrice: true,
    weight: 0.6, // критично - если не включается, сильно снижаем цену
    critical: true,
    icon: 'power',
  },
  {
    key: 'repair_history',
    title: 'Был ли ремонт?',
    description: 'Устройство ремонтировалось ранее',
    affectsPrice: true,
    weight: 0.1, // умеренное влияние
    critical: false,
    icon: 'tool',
  },
  {
    key: 'true_tone',
    title: 'True Tone',
    description: 'Автоматическая настройка цветопередачи',
    affectsPrice: true,
    weight: 0.03, // небольшое влияние
    critical: false,
    icon: 'display',
  },
  {
    key: 'face_id',
    title: 'Face ID',
    description: 'Распознавание лица работает корректно',
    affectsPrice: true,
    weight: 0.08, // важная функция
    critical: false,
    icon: 'face',
  },
  {
    key: 'touch_id',
    title: 'Touch ID',
    description: 'Сканер отпечатка пальца работает',
    affectsPrice: true,
    weight: 0.06, // важная функция
    critical: false,
    icon: 'fingerprint',
  },
  {
    key: 'front_camera',
    title: 'Фронтальная камера',
    description: 'Камера для селфи работает без дефектов',
    affectsPrice: true,
    weight: 0.05, // умеренное влияние
    critical: false,
    icon: 'camera',
  },
  {
    key: 'back_camera',
    title: 'Основная камера',
    description: 'Задняя камера работает без дефектов',
    affectsPrice: true,
    weight: 0.07, // важная функция
    critical: false,
    icon: 'camera',
  },
  {
    key: 'microphone',
    title: 'Микрофон',
    description: 'Запись звука работает корректно',
    affectsPrice: true,
    weight: 0.04, // умеренное влияние
    critical: false,
    icon: 'mic',
  },
  {
    key: 'speaker',
    title: 'Динамик',
    description: 'Воспроизведение звука работает',
    affectsPrice: true,
    weight: 0.04, // умеренное влияние
    critical: false,
    icon: 'volume',
  },
  {
    key: 'battery',
    title: 'Батарея',
    description: 'Батарея держит заряд нормально',
    affectsPrice: true,
    weight: 0.08, // важная функция
    critical: false,
    icon: 'battery',
  },
  {
    key: 'buttons',
    title: 'Кнопки',
    description: 'Все физические кнопки работают',
    affectsPrice: true,
    weight: 0.05, // умеренное влияние
    critical: false,
    icon: 'button',
  },
  {
    key: 'water_resistance',
    title: 'Влагозащита',
    description: 'Устройство защищено от влаги',
    affectsPrice: true,
    weight: 0.06, // важная функция
    critical: false,
    icon: 'droplet',
  },
  {
    key: 'cellular',
    title: 'Сотовая связь',
    description: 'Работает с SIM-картой',
    affectsPrice: true,
    weight: 0.05, // умеренное влияние
    critical: false,
    icon: 'signal',
  },
  {
    key: 'wifi',
    title: 'Wi-Fi',
    description: 'Подключение к Wi-Fi работает',
    affectsPrice: true,
    weight: 0.04, // умеренное влияние
    critical: false,
    icon: 'wifi',
  },
  {
    key: 'bluetooth',
    title: 'Bluetooth',
    description: 'Беспроводное подключение работает',
    affectsPrice: true,
    weight: 0.03, // небольшое влияние
    critical: false,
    icon: 'bluetooth',
  },
]

export interface DeviceFunctionState {
  [key: string]: 'working' | 'not_working' | 'unknown'
}

export function calculateFunctionDiscount(
  functions: DeviceFunctionState,
  deviceFunctions: DeviceFunction[]
): number {
  let totalDiscount = 0

  for (const func of deviceFunctions) {
    const state = functions[func.key]

    if (state === 'not_working' && func.affectsPrice) {
      totalDiscount += func.weight
    }
  }

  return Math.min(totalDiscount, 0.8) // максимум 80% скидки
}

export function getCriticalFunctionsStatus(
  functions: DeviceFunctionState,
  deviceFunctions: DeviceFunction[]
): {
  hasCriticalIssues: boolean
  criticalIssues: string[]
} {
  const criticalIssues: string[] = []

  for (const func of deviceFunctions) {
    if (
      func.critical &&
      functions[func.key] === 'not_working'
    ) {
      criticalIssues.push(func.title)
    }
  }

  return {
    hasCriticalIssues: criticalIssues.length > 0,
    criticalIssues,
  }
}
