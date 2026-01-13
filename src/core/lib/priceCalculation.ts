/**
 * Адаптированная формула расчёта цен на основе второго промта
 * Реализует систему диапазона цен с защитой прибыли и факторами риска
 */

export interface DeviceConditions {
  front?: string
  back?: string
  side?: string
}

export interface AdditionalConditions {
  faceId?: string
  touchId?: string
  backCamera?: string
  battery?: string
}

export interface DeviceFunctionState {
  [key: string]: 'working' | 'not_working' | 'unknown'
}

export interface PriceRange {
  min: number
  max: number
  midpoint: number
}

/**
 * Факторы риска по моделям устройств
 * Чем новее модель - тем меньше риск
 *
 * ОБНОВЛЕННАЯ МОДЕЛЬ (2024):
 * - iPhone 17: 2% (новейшие технологии, максимальная надежность)
 * - iPhone 16: 3% (титановые корпуса, A18 Pro, USB-C)
 * - iPhone 15: 5% (переход на USB-C, титан)
 * - iPhone 14: 8% (Dynamic Island, A16)
 * - iPhone 13: 12% (A15 Bionic, стабильная платформа)
 * - iPhone 12: 16% (5G, MagSafe, первые проблемы)
 * - iPhone 11: 20% (A13, устаревающая платформа)
 * - iPhone X: 25% (первый Face ID, высокий риск поломок)
 *
 * УБРАНО: iPhone 8 (слишком старый), iPhone SE (бюджетная линейка)
 * ДОБАВЛЕНО: iPhone 16/17 серии с учетом технологических скачков
 */
export const MODEL_RISK_FACTORS: Record<string, number> = {
  // iPhone 17 серия - ультра-минимальный риск (новейшие технологии)
  'iPhone 17': 0.02,
  'iPhone 17 Plus': 0.02,
  'iPhone 17 Pro': 0.02,
  'iPhone 17 Pro Max': 0.02,

  // iPhone 16 серия - минимальный риск (титановые корпуса, A18 Pro)
  'iPhone 16': 0.03,
  'iPhone 16 Plus': 0.03,
  'iPhone 16 Pro': 0.03,
  'iPhone 16 Pro Max': 0.03,

  // iPhone 15 серия - очень низкий риск (USB-C, титан)
  'iPhone 15': 0.05,
  'iPhone 15 Plus': 0.05,
  'iPhone 15 Pro': 0.05,
  'iPhone 15 Pro Max': 0.05,

  // iPhone 14 серия - низкий риск (Dynamic Island)
  'iPhone 14': 0.08,
  'iPhone 14 Plus': 0.08,
  'iPhone 14 Pro': 0.08,
  'iPhone 14 Pro Max': 0.08,

  // iPhone 13 серия - средний риск (A15 Bionic)
  'iPhone 13': 0.12,
  'iPhone 13 mini': 0.12,
  'iPhone 13 Pro': 0.12,
  'iPhone 13 Pro Max': 0.12,

  // iPhone 12 серия - повышенный риск (5G, MagSafe)
  'iPhone 12': 0.16,
  'iPhone 12 mini': 0.16,
  'iPhone 12 Pro': 0.16,
  'iPhone 12 Pro Max': 0.16,

  // iPhone 11 серия - высокий риск (A13 Bionic)
  'iPhone 11': 0.2,
  'iPhone 11 Pro': 0.2,
  'iPhone 11 Pro Max': 0.2,

  // iPhone X серия - очень высокий риск (первый Face ID)
  'iPhone X': 0.25,
  'iPhone XR': 0.25,
  'iPhone XS': 0.25,
  'iPhone XS Max': 0.25,

  // По умолчанию для неизвестных моделей
  default: 0.15,
}

/**
 * Константы для расчёта цен
 */
export const PRICE_CONSTANTS = {
  // Базовая маржа компании (15% вместо 25% из промта)
  COMPANY_MARGIN: 0.15,

  // Минимальная цена относительно базовой (50%)
  MIN_PRICE_RATIO: 0.5,

  // Максимальная цена относительно базовой (95%)
  MAX_PRICE_RATIO: 0.95,

  // Минимальный диапазон цен (1000 рублей)
  MIN_RANGE: 1000,
}

/**
 * Получить фактор риска для модели устройства
 */
export function getModelRiskFactor(
  modelName: string
): number {
  // Ищем точное совпадение
  if (MODEL_RISK_FACTORS[modelName]) {
    return MODEL_RISK_FACTORS[modelName]
  }

  // Ищем частичное совпадение (например, "iPhone 13 Pro" содержит "iPhone 13")
  for (const [model, risk] of Object.entries(
    MODEL_RISK_FACTORS
  )) {
    if (modelName.includes(model) && model !== 'default') {
      return risk
    }
  }

  // Возвращаем значение по умолчанию для неизвестных моделей
  console.warn(
    `Неизвестная модель устройства: ${modelName}, используем фактор риска по умолчанию`
  )
  return MODEL_RISK_FACTORS.default
}

/**
 * Рассчитать общий дисконт за дефекты
 * Адаптирует существующую логику из проекта
 */
export function calculateDefectDiscount(
  deviceConditions: DeviceConditions,
  additionalConditions: AdditionalConditions,
  deviceFunctionStates?: DeviceFunctionState
): number {
  let totalDiscount = 0

  // Штрафы за состояние экрана (из существующей логики)
  if (deviceConditions.front) {
    if (deviceConditions.front === 'Новый')
      totalDiscount += 0
    else if (deviceConditions.front === 'Очень хорошее')
      totalDiscount += 0.03
    else if (deviceConditions.front === 'Заметные царапины')
      totalDiscount += 0.08
    else if (deviceConditions.front === 'Трещины')
      totalDiscount += 0.15
  }

  if (deviceConditions.back) {
    if (deviceConditions.back === 'Новый')
      totalDiscount += 0
    else if (deviceConditions.back === 'Очень хорошее')
      totalDiscount += 0.03
    else if (deviceConditions.back === 'Заметные царапины')
      totalDiscount += 0.08
    else if (deviceConditions.back === 'Трещины')
      totalDiscount += 0.15
  }

  if (deviceConditions.side) {
    if (deviceConditions.side === 'Новый')
      totalDiscount += 0
    else if (deviceConditions.side === 'Очень хорошее')
      totalDiscount += 0.03
    else if (deviceConditions.side === 'Заметные царапины')
      totalDiscount += 0.08
    else if (deviceConditions.side === 'Трещины')
      totalDiscount += 0.15
  }

  // Штрафы за дополнительные условия
  if (additionalConditions.faceId) {
    if (additionalConditions.faceId === 'Не работает')
      totalDiscount += 0.1
  }

  if (additionalConditions.touchId) {
    if (additionalConditions.touchId === 'Не работает')
      totalDiscount += 0.08
  }

  if (additionalConditions.backCamera) {
    if (additionalConditions.backCamera === 'Очень хорошее')
      totalDiscount += 0.03
    else if (
      additionalConditions.backCamera ===
      'Заметные царапины'
    )
      totalDiscount += 0.08
    else if (additionalConditions.backCamera === 'Трещины')
      totalDiscount += 0.15
  }

  if (additionalConditions.battery) {
    if (additionalConditions.battery === '90%')
      totalDiscount += 0.02
    else if (additionalConditions.battery === '85%')
      totalDiscount += 0.05
    else if (additionalConditions.battery === '75%')
      totalDiscount += 0.1
  }

  // НОВЫЕ ШТРАФЫ ЗА ФУНКЦИИ УСТРОЙСТВА
  if (deviceFunctionStates) {
    // Критические функции (стопперы)
    if (
      deviceFunctionStates.device_power === 'not_working'
    ) {
      totalDiscount += 0.6 // Критично - если не включается
    }

    // Ремонт
    if (
      deviceFunctionStates.repair_history === 'not_working'
    ) {
      totalDiscount += 0.1 // Умеренное влияние
    }

    // True Tone
    if (deviceFunctionStates.true_tone === 'not_working') {
      totalDiscount += 0.03 // Небольшое влияние
    }

    // Face ID
    if (deviceFunctionStates.face_id === 'not_working') {
      totalDiscount += 0.08 // Важная функция
    }

    // Камеры
    if (
      deviceFunctionStates.front_camera === 'not_working'
    ) {
      totalDiscount += 0.05 // Умеренное влияние
    }

    if (
      deviceFunctionStates.back_camera === 'not_working'
    ) {
      totalDiscount += 0.07 // Важная функция
    }

    // Аудио
    if (deviceFunctionStates.microphone === 'not_working') {
      totalDiscount += 0.04 // Умеренное влияние
    }

    if (deviceFunctionStates.speaker === 'not_working') {
      totalDiscount += 0.04 // Умеренное влияние
    }

    // Батарея
    if (deviceFunctionStates.battery === 'not_working') {
      totalDiscount += 0.08 // Важная функция
    }

    // Кнопки
    if (deviceFunctionStates.buttons === 'not_working') {
      totalDiscount += 0.05 // Умеренное влияние
    }

    // Влагозащита
    if (
      deviceFunctionStates.water_resistance ===
      'not_working'
    ) {
      totalDiscount += 0.06 // Важная функция
    }

    // Связь
    if (deviceFunctionStates.cellular === 'not_working') {
      totalDiscount += 0.05 // Умеренное влияние
    }

    if (deviceFunctionStates.wifi === 'not_working') {
      totalDiscount += 0.04 // Умеренное влияние
    }

    if (deviceFunctionStates.bluetooth === 'not_working') {
      totalDiscount += 0.03 // Небольшое влияние
    }
  }

  // Ограничиваем максимальный дисконт 80%
  return Math.min(totalDiscount, 0.8)
}

/**
 * Адаптированная формула расчёта диапазона цен из второго промта
 *
 * P_max = R × (1 - D)           // Максимальная цена (без учёта рисков)
 * P_min = P_max × (1 - 0.15 - Rm)  // Минимальная цена (с маржей + рисками)
 *
 * Где:
 * R - базовая цена устройства
 * D - дисконт за дефекты
 * Rm - фактор риска модели
 * 0.15 - маржа компании (15%)
 */
export function calculatePriceRange(
  basePrice: number,
  modelName: string,
  deviceConditions: DeviceConditions,
  additionalConditions: AdditionalConditions,
  overrideDiscount?: number,
  deviceFunctionStates?: DeviceFunctionState
): PriceRange {
  // Рассчитываем дисконт за дефекты (или используем принудительный, если передан)
  const defectDiscount =
    typeof overrideDiscount === 'number' &&
    !isNaN(overrideDiscount)
      ? Math.max(0, Math.min(1, overrideDiscount))
      : calculateDefectDiscount(
          deviceConditions,
          additionalConditions,
          deviceFunctionStates
        )

  // Получаем фактор риска модели
  const modelRiskFactor = getModelRiskFactor(modelName)

  // Рассчитываем максимальную цену (без учёта рисков и маржи)
  const maxPrice = basePrice * (1 - defectDiscount)

  // Рассчитываем минимальную цену (с учётом маржи и рисков)
  const minPrice =
    maxPrice *
    (1 - PRICE_CONSTANTS.COMPANY_MARGIN - modelRiskFactor)

  // Ограничиваем минимальную цену
  const finalMinPrice = Math.max(
    minPrice,
    basePrice * PRICE_CONSTANTS.MIN_PRICE_RATIO
  )

  // Ограничиваем максимальную цену
  const finalMaxPrice = Math.min(
    maxPrice,
    basePrice * PRICE_CONSTANTS.MAX_PRICE_RATIO
  )

  // Округляем до сотен
  const min = Math.floor(finalMinPrice / 100) * 100
  const max = Math.ceil(finalMaxPrice / 100) * 100

  // Динамический минимальный диапазон: масштабируем с ценой и тяжестью дефекта
  // База 2% от basePrice, + до 6% при сильных дефектах (дефект >= 60%)
  const dynamicMinRangeRaw =
    basePrice * (0.02 + 0.06 * Math.min(1, defectDiscount))
  const dynamicMinRange = Math.max(
    PRICE_CONSTANTS.MIN_RANGE,
    Math.round(dynamicMinRangeRaw / 100) * 100
  )

  // Проверяем минимальный диапазон
  let finalMin = min
  let finalMax = max

  if (finalMax - finalMin < dynamicMinRange) {
    // Если диапазон слишком мал, расширяем его симметрично от центра
    const center = (finalMin + finalMax) / 2
    finalMin =
      Math.floor((center - dynamicMinRange / 2) / 100) * 100
    finalMax =
      Math.ceil((center + dynamicMinRange / 2) / 100) * 100
  }

  // Рассчитываем среднюю цену
  const midpoint =
    Math.round((finalMin + finalMax) / 2 / 100) * 100

  return {
    min: finalMin,
    max: finalMax,
    midpoint,
  }
}

/**
 * Получить объяснение диапазона цен для клиента
 */
export function getPriceRangeExplanation(
  priceRange: PriceRange
): string {
  const rangePercent = Math.round(
    ((priceRange.max - priceRange.min) / priceRange.max) *
      100
  )

  return `Диапазон цен: от ${priceRange.min.toLocaleString()}₽ до ${priceRange.max.toLocaleString()}₽

Верхняя цена - при идеальном состоянии устройства.
Нижняя цена - с учётом возможных скрытых проблем и нашей маржи.

Разница составляет ${rangePercent}% от максимальной цены.`
}

/**
 * Пример использования новой формулы
 */
export function exampleUsage() {
  const basePrice = 60000 // iPhone 13 Pro 128GB
  const modelName = 'iPhone 13 Pro'

  const deviceConditions: DeviceConditions = {
    front: 'Заметные царапины',
    back: 'Очень хорошее',
    side: 'Новый',
  }

  const additionalConditions: AdditionalConditions = {
    faceId: 'Работает',
    touchId: 'Работает',
    backCamera: 'Очень хорошее',
    battery: '85%',
  }

  const priceRange = calculatePriceRange(
    basePrice,
    modelName,
    deviceConditions,
    additionalConditions
  )

  console.log('Пример расчёта:', {
    basePrice,
    modelName,
    deviceConditions,
    additionalConditions,
    priceRange,
    explanation: getPriceRangeExplanation(priceRange),
  })

  return priceRange
}
