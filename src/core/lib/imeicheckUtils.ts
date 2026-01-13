/**
 * Утилиты для работы с imeicheck.net API - УПРОЩЕННАЯ ВЕРСИЯ
 */

interface IMEICheckResponse {
  id: string
  status: 'pending' | 'completed' | 'failed'
  data?: {
    deviceName?: string
    model?: string
    brand?: string
    color?: string
    storage?: string
    properties?: {
      deviceName?: string
      appleModelName?: string
      model?: string
      [key: string]: any
    }
    [key: string]: any
  }
  normalized?: {
    deviceName?: string
    [key: string]: any
  }
  error?: string
}

/**
 * Единая функция для проверки IMEI - создает проверку и ждет результат
 */
export async function createIMEICheck(
  imei: string
): Promise<IMEICheckResponse | null> {
  if (
    !imei ||
    typeof imei !== 'string' ||
    imei.trim().length === 0
  ) {
    console.error('❌ Invalid IMEI provided:', imei)
    return null
  }

  try {
    console.log('🔍 Отправляем запрос к единому API:', imei)

    const response = await fetch('/api/imeicheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: imei,
        serviceId: 1,
      }),
    })

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'Unknown error')
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      )
    }

    const result = await response.json()
    console.log('✅ Результат от единого API:', result)

    if (result.success && result.data) {
      return {
        id: 'completed',
        status: 'completed' as const,
        data: result.data,
        normalized: result.normalized,
      }
    }

    console.error('❌ Неожиданный формат ответа:', result)
    return null
  } catch (error) {
    console.error('❌ Ошибка единого API:', error)
    return null
  }
}

/**
 * Парсит данные устройства из ответа imeicheck.net
 */
export function parseIMEIDeviceData(
  imeiData: IMEICheckResponse
): {
  model: string
  variant: string
  storage: string
  color: string
} | null {
  if (!imeiData?.data) {
    console.error('❌ Нет данных для парсинга')
    return null
  }

  console.log('🔍 Парсим данные IMEI:', imeiData.data)

  // Ищем deviceName в разных полях
  const deviceName =
    imeiData.data?.deviceName ||
    imeiData.data?.properties?.deviceName ||
    imeiData.data?.properties?.appleModelName ||
    imeiData.data?.properties?.model ||
    imeiData.normalized?.deviceName ||
    ''

  console.log('🔍 Найден deviceName:', deviceName)

  if (!deviceName) {
    console.error('❌ deviceName не найден в данных')
    return null
  }

  // Парсим модель и вариант из deviceName
  // Примеры: "iPhone XR 128GB Black" → model: "X", variant: "R"
  //          "iPhone 14 Pro 256GB Blue" → model: "14", variant: "Pro"
  //          "iPhone 15 Pro Max 512GB Black" → model: "15", variant: "Pro Max"

  // Сначала проверяем комбинированные модели типа XR, XS, SE, Pro, Pro Max
  const combinedMatch = deviceName.match(
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
      const miniMatch = deviceName.match(
        /iPhone\s+(\d+)\s+mini/i
      )
      if (miniMatch) {
        model = miniMatch[1]
        variant = 'mini'
      }
    } else if (combinedModel === 'Plus') {
      // Для Plus нужно найти номер модели
      const plusMatch = deviceName.match(
        /iPhone\s+(\d+)\s+Plus/i
      )
      if (plusMatch) {
        model = plusMatch[1]
        variant = 'Plus'
      }
    } else if (combinedModel === 'Pro Max') {
      // Для Pro Max нужно найти номер модели
      const proMaxMatch = deviceName.match(
        /iPhone\s+(\d+)\s+Pro Max/i
      )
      if (proMaxMatch) {
        model = proMaxMatch[1]
        variant = 'Pro Max'
      }
    } else if (combinedModel === 'Pro') {
      // Для Pro нужно найти номер модели
      const proMatch = deviceName.match(
        /iPhone\s+(\d+)\s+Pro/i
      )
      if (proMatch) {
        model = proMatch[1]
        variant = 'Pro'
      }
    }
  } else {
    // Обычные модели с номером
    const modelVariantMatch = deviceName.match(
      /iPhone\s+(\d+)(?:\s+(\w+(?:\s+\w+)?))?/i
    )
    if (modelVariantMatch) {
      model = modelVariantMatch[1] || ''
      variant = modelVariantMatch[2] || ''
    }
  }

  // Парсим память
  const storageMatch = deviceName.match(/(\d+GB)/i)
  const storage = storageMatch ? storageMatch[1] : ''

  // Парсим цвет
  const colorMatch = deviceName.match(
    /(Black|White|Red|Blue|Purple|Green|Gold|Silver|Space Gray|Midnight|Starlight)/i
  )
  const color = colorMatch ? colorMatch[1] : ''

  const result = {
    model: model || 'Модель не указана',
    variant: variant || '',
    storage: storage || '128GB',
    color: color || 'Black',
  }

  console.log('✅ Результат парсинга:', {
    deviceName,
    model: result.model,
    variant: result.variant,
    storage: result.storage,
    color: result.color,
  })
  return result
}

/**
 * Сохраняет данные устройства в БД
 */
export async function saveDeviceDataToDB(
  telegramId: string,
  serialNumber: string,
  deviceData: any,
  username?: string
): Promise<void> {
  try {
    console.log('💾 Сохраняем данные в БД:', {
      telegramId,
      serialNumber,
      username,
    })

    const response = await fetch('/api/devices/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId,
        serialNumber,
        deviceData,
        username: username || 'unknown',
      }),
    })

    if (!response.ok) {
      console.error(
        '❌ Ошибка сохранения в БД:',
        response.statusText
      )
    } else {
      console.log('✅ Данные сохранены в БД')
    }
  } catch (error) {
    console.error('❌ Ошибка сохранения в БД:', error)
  }
}

// Удаляем старые функции - они больше не нужны
export const getIMEICheckResult = () => {
  console.warn(
    '⚠️ getIMEICheckResult больше не используется - используйте createIMEICheck'
  )
  return null
}
