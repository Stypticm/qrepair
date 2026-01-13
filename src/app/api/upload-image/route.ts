import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Создаём Supabase клиент с service role key для серверных операций
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    const fileExt = file.name.split('.').pop()
    const finalFileName =
      fileName || `${uuidv4()}.${fileExt}`
    const filePath = `${finalFileName}`

    // Загружаем файл в Supabase Storage
    const { error } = await supabase.storage
      .from('items')
      .upload(filePath, file)

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Получаем публичный URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from('items')
      .getPublicUrl(filePath)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
