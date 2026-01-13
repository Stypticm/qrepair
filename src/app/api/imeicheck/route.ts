import { NextRequest, NextResponse } from 'next/server'

/**
 * Единый API endpoint для работы с imeicheck.net
 * POST /api/imeicheck - создание проверки и получение результата
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, serviceId = 1 } = body

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId обязателен' },
        { status: 400 }
      )
    }

    const apiKey = process.env.IMEICHECK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMEICHECK_API_KEY не настроен' },
        { status: 500 }
      )
    }

    console.log('🔍 Отправляем запрос к imeicheck.net:', {
      deviceId,
      serviceId,
      url: 'https://api.imeicheck.net/v1/checks',
    })

    // Создаем проверку
    const createResponse = await fetch(
      'https://api.imeicheck.net/v1/checks',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, serviceId }),
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error(
        '❌ Ошибка создания проверки:',
        errorText
      )
      throw new Error(
        `HTTP ${createResponse.status}: ${createResponse.statusText}`
      )
    }

    const createResult = await createResponse.json()
    console.log('✅ Проверка создана:', createResult)

    // Если проверка завершена сразу - возвращаем результат
    if (
      (createResult.status === 'completed' ||
        createResult.status === 'successful') &&
      createResult.properties
    ) {
      console.log('✅ Проверка завершена сразу!')
      return NextResponse.json({
        success: true,
        data: createResult.properties,
        normalized: createResult.normalized,
      })
    }

    // Если данных нет - ошибка
    console.error('❌ Нет данных в ответе:', createResult)
    throw new Error('Не получены данные устройства')
  } catch (error) {
    console.error('❌ Ошибка IMEI check:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Неизвестная ошибка',
      },
      { status: 500 }
    )
  }
}
