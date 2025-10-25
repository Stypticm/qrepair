/**
 * Утилиты для работы с базовой ценой устройства
 */

/**
 * Получить базовую цену устройства с fallback механизмом
 * @param modelname - Название модели устройства (например, "iPhone 14 Pro 128GB")
 * @returns Promise<number | null> - Базовая цена или null если не найдена
 */
export async function getBasePriceWithFallback(
  modelname?: string
): Promise<number | null> {
  // Сначала пытаемся получить из sessionStorage
  if (typeof window !== 'undefined') {
    const savedBasePrice =
      sessionStorage.getItem('basePrice')
    if (savedBasePrice) {
      const parsed = parseFloat(savedBasePrice)
      if (!isNaN(parsed) && parsed > 0) {
        console.log(
          '💰 Используем базовую цену из sessionStorage:',
          parsed
        )
        return parsed
      }
    }
  }

  // Fallback: пытаемся получить базовую цену из API
  console.log(
    '⚠️ Базовая цена не найдена в sessionStorage, пытаемся получить через API'
  )

  if (!modelname) {
    console.error(
      'Не найдена модель устройства для получения базовой цены'
    )
    return null
  }

  try {
    // Парсим модель для получения параметров поиска
    // Примеры: "iPhone 17 Pro 256GB" -> model: "17", variant: "Pro", storage: "256GB"
    const modelParts = modelname.split(' ')

    // Находим номер модели (первое число после "iPhone")
    const modelMatch = modelname.match(/iPhone\s+(\d+)/)
    const model = modelMatch
      ? modelMatch[1]
      : modelParts[1] || ''

    // Находим вариант (все слова между номером модели и объемом памяти)
    const storageMatch = modelname.match(/(\d+GB|\d+TB)/)
    const storage = storageMatch
      ? storageMatch[1]
      : modelParts[modelParts.length - 1]

    // Извлекаем вариант из оставшейся части
    const afterModel = modelname
      .replace(`iPhone ${model}`, '')
      .replace(storage, '')
      .trim()
    const variant = afterModel || ''

    // Пробуем разные цвета для поиска устройства
    const colors = [
      'Bl',
      'Wh',
      'Gr',
      'Pi',
      'Go',
      'Ye',
      'Re',
      'Pu',
    ]
    let device = null

    for (const color of colors) {
      const params = new URLSearchParams({
        model: model,
        storage: storage,
        color: color,
      })

      if (variant) {
        params.set('variant', variant)
      }

      const response = await fetch(
        `/api/devices/device?${params.toString()}`
      )
      if (response.ok) {
        device = await response.json()
        if (device?.basePrice) {
          break
        }
      }
    }

    if (device?.basePrice) {
      const basePrice = device.basePrice
      // Сохраняем для следующих страниц
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'basePrice',
          basePrice.toString()
        )
      }
      console.log(
        '✅ Получена базовая цена через API:',
        basePrice
      )
      return basePrice
    } else {
      console.error(
        'Не удалось получить базовую цену через API'
      )
      return null
    }
  } catch (apiError) {
    console.error(
      'Ошибка при получении базовой цены через API:',
      apiError
    )
    return null
  }
}

/**
 * Парсить название модели устройства на компоненты
 * @param modelname - Название модели (например, "iPhone 14 Pro 128GB")
 * @returns Объект с компонентами модели
 */
export function parseModelName(modelname: string): {
  model: string
  variant: string
  storage: string
} {
  // Находим номер модели (первое число после "iPhone")
  const modelMatch = modelname.match(/iPhone\s+(\d+)/)
  const model = modelMatch ? modelMatch[1] : ''

  // Находим объем памяти
  const storageMatch = modelname.match(/(\d+GB|\d+TB)/)
  const storage = storageMatch ? storageMatch[1] : ''

  // Извлекаем вариант из оставшейся части
  const afterModel = modelname
    .replace(`iPhone ${model}`, '')
    .replace(storage, '')
    .trim()
  const variant = afterModel || ''

  return {
    model,
    variant,
    storage,
  }
}
