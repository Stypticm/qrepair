import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

/**
 * API для сохранения данных устройства в БД
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      telegramId,
      serialNumber,
      deviceData,
      username,
    } = body

    if (!telegramId || !serialNumber || !deviceData) {
      return NextResponse.json(
        { error: 'Не все обязательные поля предоставлены' },
        { status: 400 }
      )
    }

    // Сохраняем в таблицу Skupka
    const skupka = await api.create<any>('skupkas', {
      telegramId,
      sn: serialNumber,
      deviceData: JSON.stringify(deviceData),
      status: 'draft',
      username: username || 'unknown',
    })

    console.log('✅ Данные сохранены в БД:', skupka.id)

    return NextResponse.json({
      success: true,
      id: skupka.id,
    })
  } catch (error) {
    console.error('❌ Ошибка сохранения в БД:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
