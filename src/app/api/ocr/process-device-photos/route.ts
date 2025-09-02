import { NextRequest, NextResponse } from 'next/server'
import { createWorker, PSM } from 'tesseract.js'

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

    // Реальная OCR обработка
    const result = await processOCR(snImage, imeiImage)

    return NextResponse.json(result)
  } catch (error) {
    console.error('OCR API Error:', error)

    // Возвращаем более детальную ошибку
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error'

    return NextResponse.json(
      {
        error: 'OCR processing failed',
        details: errorMessage,
        suggestion:
          'Попробуйте изображения с более четким текстом или меньшего размера',
      },
      { status: 500 }
    )
  }
}

// Функция для обработки одного изображения с таймаутом
async function processSingleImage(
  image: File,
  worker: any
) {
  // File уже является Blob, поэтому используем arrayBuffer() напрямую
  const arrayBuffer = await image.arrayBuffer()

  // Добавляем таймаут для каждого изображения
  return await Promise.race([
    worker.recognize(Buffer.from(arrayBuffer)),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Single image OCR timeout')),
        20000
      )
    ),
  ])
}

// Функция для обработки OCR с Tesseract.js
async function processOCR(snImage: File, imeiImage: File) {
  // Создаем отдельные worker'ы для каждого изображения
  const [snWorker, imeiWorker] = await Promise.all([
    createWorker('eng'),
    createWorker('eng'),
  ])

  try {
    // Настраиваем оба worker'а
    const setupWorker = async (worker: any) => {
      await worker.setParameters({
        tessedit_char_whitelist:
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_WORD,
        tessedit_ocr_engine_mode: 2,
        tessedit_do_invert: '0',
        tessedit_char_blacklist:
          '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
      })
    }

    // Настраиваем worker'ы параллельно
    await Promise.all([
      setupWorker(snWorker),
      setupWorker(imeiWorker),
    ])

    // Обрабатываем изображения параллельно с отдельными worker'ами
    const [snResult, imeiResult] = await Promise.all([
      processSingleImage(snImage, snWorker),
      processSingleImage(imeiImage, imeiWorker),
    ])

    const serialNumber = extractSerialNumber(
      snResult.data.text
    )
    const imei = extractIMEI(imeiResult.data.text)

    // Валидируем результаты
    const isValidIMEI = validateIMEI(imei)
    const isValidSN = validateSerialNumber(serialNumber)

    const result = {
      serialNumber: isValidSN ? serialNumber : null,
      imei: isValidIMEI ? imei : null,
      confidence: Math.min(
        snResult.data.confidence,
        imeiResult.data.confidence
      ),
      method: 'ocr',
      isValidIMEI,
      isValidSN,
    }

    return result
  } finally {
    // Завершаем оба worker'а
    await Promise.all([
      snWorker.terminate(),
      imeiWorker.terminate(),
    ])
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
