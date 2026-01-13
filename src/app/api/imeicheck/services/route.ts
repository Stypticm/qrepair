import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint для получения списка доступных сервисов
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.IMEICHECK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMEICHECK_API_KEY не настроен' },
        { status: 500 }
      )
    }

    console.log('🔍 Получаем список сервисов imeicheck.net')

    const response = await fetch(
      'https://api.imeicheck.net/v1/services',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('🔍 Ответ сервисов:', {
      status: response.status,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        '🔍 Ошибка получения сервисов:',
        errorText
      )
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      )
    }

    const result = await response.json()
    console.log('🔍 Список сервисов:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Ошибка получения сервисов:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
