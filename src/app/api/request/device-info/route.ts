import { NextResponse } from 'next/server'
import { RequestManager } from '@/core/lib/requestManager'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegramId, username, serialNumber } = body

    console.log('🔍 API device-info: Получены данные:', {
      telegramId,
      username,
      serialNumber,
    })

    if (!telegramId || !serialNumber) {
      console.error(
        '❌ API device-info: Отсутствуют обязательные поля',
        { telegramId, serialNumber }
      )
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Используем RequestManager для единой логики
    const updatedRequest =
      await RequestManager.updateActiveRequest(telegramId, {
        username: username || 'Unknown',
        sn: serialNumber,
        currentStep: 'device-info',
      })

    console.log(
      '✅ API device-info: Заявка обновлена:',
      updatedRequest.id
    )

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error(
      '❌ API device-info: Ошибка при сохранении:',
      error
    )
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
