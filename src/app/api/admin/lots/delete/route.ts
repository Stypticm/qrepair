import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: NextRequest) {
  try {
    const { lotId } = await request.json()

    if (!lotId) {
      return NextResponse.json(
        { error: 'ID лота обязателен' },
        { status: 400 }
      )
    }

    // Проверяем права доступа
    const telegramId = request.headers.get('x-telegram-id')
    const adminIds = ['1', '296925626', '531360988']

    if (!telegramId || !adminIds.includes(telegramId)) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // Создаём Supabase клиент
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Удаляем лот
    const { error } = await supabase
      .from('Skupka')
      .delete()
      .eq('id', lotId)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json(
        { error: 'Ошибка удаления лота' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Лот успешно удален',
    })
  } catch (error) {
    console.error('Delete lot error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
