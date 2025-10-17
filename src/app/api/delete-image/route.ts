import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL изображения не найден' },
        { status: 400 }
      )
    }

    // Создаём Supabase клиент с service role key для серверных операций
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Извлекаем имя файла из URL
    const fileName = imageUrl.split('/').pop()
    if (!fileName) {
      return NextResponse.json(
        { error: 'Неверный URL изображения' },
        { status: 400 }
      )
    }

    // Удаляем файл из Supabase Storage
    const { error } = await supabase.storage
      .from('master-photos')
      .remove([fileName])

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления файла' },
      { status: 500 }
    )
  }
}
