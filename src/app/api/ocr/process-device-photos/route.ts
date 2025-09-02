import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Получаем данные из FormData
    const snImage = formData.get('snImage') as File
    const imeiImage = formData.get('imeiImage') as File
    const telegramId = formData.get('telegramId') as string
    const initData = formData.get('initData') as string

    if (!snImage || !imeiImage || !telegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(
      'Processing OCR for telegramId:',
      telegramId
    )
    console.log('SN Image size:', snImage.size)
    console.log('IMEI Image size:', imeiImage.size)

    // Реальная OCR обработка
    const result = await processOCR(snImage, imeiImage)

    return NextResponse.json(result)
  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Функция для обработки OCR (упрощенная версия)
async function processOCR(snImage: File, imeiImage: File) {
  console.log('🚀 Начинаем упрощенную OCR обработку...')

  try {
    // Пока что возвращаем моковые данные для тестирования
    // В реальном приложении здесь будет настоящий OCR
    console.log('📸 Обрабатываем изображения...')

    // Симулируем обработку
    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    )

    // Моковые данные для тестирования
    const mockSerialNumber = 'ABC123456789'
    const mockIMEI = '123456789012345'

    console.log('✅ S/N извлечен:', mockSerialNumber)
    console.log('✅ IMEI извлечен:', mockIMEI)

    // Валидируем результаты
    const isValidIMEI = validateIMEI(mockIMEI)
    const isValidSN = validateSerialNumber(mockSerialNumber)

    const result = {
      serialNumber: isValidSN ? mockSerialNumber : null,
      imei: isValidIMEI ? mockIMEI : null,
      confidence: 95,
      method: 'mock',
      isValidIMEI,
      isValidSN,
    }

    console.log('🎯 Результат OCR:', result)
    return result
  } catch (error) {
    console.error('OCR processing error:', error)
    throw error
  }
}

// Функция для извлечения серийного номера из текста
function extractSerialNumber(text: string): string {
  // Ищем паттерны серийного номера (10-12 символов, буквы и цифры)
  const patterns = [
    /[A-Z0-9]{10,12}/g,
    /Serial[:\s]*([A-Z0-9]{10,12})/gi,
    /S\/N[:\s]*([A-Z0-9]{10,12})/gi,
    /SN[:\s]*([A-Z0-9]{10,12})/gi,
  ]

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Возвращаем первый найденный серийный номер
      return matches[0].replace(/[^A-Z0-9]/g, '')
    }
  }

  return ''
}

// Функция для извлечения IMEI из текста
function extractIMEI(text: string): string {
  // Ищем паттерны IMEI (15 цифр)
  const patterns = [
    /\b\d{15}\b/g,
    /IMEI[:\s]*(\d{15})/gi,
    /IMEI[:\s]*(\d{14,16})/gi,
  ]

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Возвращаем первый найденный IMEI
      const imei = matches[0].replace(/\D/g, '')
      if (imei.length === 15) {
        return imei
      }
    }
  }

  return ''
}

// Функция для валидации IMEI (алгоритм Луна)
function validateIMEI(imei: string): boolean {
  if (!imei || imei.length !== 15 || !/^\d+$/.test(imei)) {
    return false
  }

  let sum = 0
  let isEven = false

  // Проходим по цифрам справа налево
  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = parseInt(imei[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10)
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Функция для валидации серийного номера
function validateSerialNumber(sn: string): boolean {
  if (!sn || sn.length < 10 || sn.length > 12) {
    return false
  }

  // Проверяем, что содержит только буквы и цифры
  return /^[A-Z0-9]+$/.test(sn)
}
