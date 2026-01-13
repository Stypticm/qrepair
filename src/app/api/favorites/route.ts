import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { requestId, action } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'ID заявки и действие обязательны' },
        { status: 400 }
      )
    }

    // Получаем данные пользователя из Telegram WebApp
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Используем Telegram Cloud Storage для хранения избранного
    // В реальном приложении здесь был бы вызов Telegram Bot API
    // Для демонстрации используем localStorage через клиентскую часть

    return NextResponse.json({
      success: true,
      message:
        action === 'add'
          ? 'Добавлено в избранное'
          : 'Удалено из избранного',
      requestId,
      action,
    })
  } catch (error) {
    console.error('Favorites error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // В реальном приложении здесь был бы вызов Telegram Bot API
    // для получения данных из Cloud Storage
    // Для демонстрации возвращаем пустой массив

    return NextResponse.json({
      success: true,
      favorites: [],
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
