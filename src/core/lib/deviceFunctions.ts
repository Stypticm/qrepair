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
    weight: 0.12, // важная функция - увеличили вес
    critical: false,
    icon: 'face',
  },
  {
    key: 'touch_id',
    title: 'Touch ID',
    description: 'Сканер отпечатка пальца работает',
    affectsPrice: true,
    weight: 0.1, // важная функция - увеличили вес
    critical: false,
    icon: 'fingerprint',
  },
  {
    key: 'front_camera',
    title: 'Фронтальная камера',
    description: 'Камера для селфи работает без дефектов',
    affectsPrice: true,
    weight: 0.08, // умеренное влияние - увеличили вес
    critical: false,
    icon: 'camera',
  },
  {
    key: 'back_camera',
    title: 'Основная камера',
    description: 'Задняя камера работает без дефектов',
    affectsPrice: true,
    weight: 0.15, // важная функция - увеличили вес
    critical: false,
    icon: 'camera',
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

    // Специальная логика для критичных функций
    if (
      func.key === 'device_power' &&
      state === 'not_working'
    ) {
      // Если телефон не включается, максимальная скидка
      return 0.8 // 80% скидка
    }

    if (
      func.key === 'repair_history' &&
      state === 'working'
    ) {
      // Если был ремонт, значительная скидка
      totalDiscount += 0.2 // 20% скидка
    }

    // Для остальных функций: если не работает, снижаем цену
    if (
      state === 'not_working' &&
      func.affectsPrice &&
      func.key !== 'device_power' &&
      func.key !== 'repair_history'
    ) {
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
