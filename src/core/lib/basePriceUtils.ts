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
    // Парсим модель и вариант из modelname
    // Примеры: "iPhone XR 128GB Black" → model: "X", variant: "R"
    //          "iPhone 14 Pro 256GB Blue" → model: "14", variant: "Pro"

    // Сначала проверяем комбинированные модели типа XR, XS, SE, Pro, Pro Max
    const combinedMatch = modelname.match(
      /iPhone\s+(XR|XS|SE|mini|Plus|Pro Max|Pro)/i
    )
    let model = ''
    let variant = ''

    if (combinedMatch) {
      const combinedModel = combinedMatch[1]
      if (combinedModel === 'XR') {
        model = 'X'
        variant = 'R'
      } else if (combinedModel === 'XS') {
        model = 'X'
        variant = 'S'
      } else if (combinedModel === 'SE') {
        model = 'SE'
        variant = ''
      } else if (combinedModel === 'mini') {
        // Для mini нужно найти номер модели
        const miniMatch = modelname.match(
          /iPhone\s+(\d+)\s+mini/i
        )
        if (miniMatch) {
          model = miniMatch[1]
          variant = 'mini'
        }
      } else if (combinedModel === 'Plus') {
        // Для Plus нужно найти номер модели
        const plusMatch = modelname.match(
          /iPhone\s+(\d+)\s+Plus/i
        )
        if (plusMatch) {
          model = plusMatch[1]
          variant = 'Plus'
        }
      } else if (combinedModel === 'Pro Max') {
        // Для Pro Max нужно найти номер модели
        const proMaxMatch = modelname.match(
          /iPhone\s+(\d+)\s+Pro Max/i
        )
        if (proMaxMatch) {
          model = proMaxMatch[1]
          variant = 'Pro Max'
        }
      } else if (combinedModel === 'Pro') {
        // Для Pro нужно найти номер модели
        const proMatch = modelname.match(
          /iPhone\s+(\d+)\s+Pro/i
        )
        if (proMatch) {
          model = proMatch[1]
          variant = 'Pro'
        }
      }
    } else {
      // Обычные модели с номером
      const modelVariantMatch = modelname.match(
        /iPhone\s+(\d+)(?:\s+(\w+(?:\s+\w+)?))?/i
      )
      if (modelVariantMatch) {
        model = modelVariantMatch[1] || ''
        variant = modelVariantMatch[2] || ''
      }
    }

    // Находим память (последнее число с GB)
    const storageMatch = modelname.match(/(\d+GB|\d+TB)/)
    const storage = storageMatch ? storageMatch[1] : '128GB'

    // Извлекаем цвет из названия модели
    const colorMatch = modelname.match(
      /(Black|White|Red|Blue|Green|Purple|Yellow|Pink|Gold|Silver|Space Gray|Midnight|Starlight|Purple|Blue|Green|Yellow|Red|Pink)/i
    )
    const extractedColor = colorMatch ? colorMatch[1] : ''

    // Маппинг цветов на коды БД
    const colorMapping: { [key: string]: string } = {
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

    const color = colorMapping[extractedColor] || 'Bl' // Fallback на Black

    console.log('🎨 Парсинг модели:', {
      modelname,
      model,
      variant,
      storage,
      extractedColor,
      color,
    })

    // Пробуем найти устройство с правильным цветом
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

    let device = null
    if (response.ok) {
      device = await response.json()
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
