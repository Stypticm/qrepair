import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/core/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  let lotId: string = ''
  let uploadedPhotos: string[] = []
  let photoFiles: File[] = []

  try {
    // Проверяем права доступа
    const telegramId = request.headers.get('x-telegram-id')
    const adminIds = ['1', '296925626', '531360988']

    if (!telegramId || !adminIds.includes(telegramId)) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    // Извлекаем данные формы
    const model = formData.get('model') as string
    const storage = formData.get('storage') as string
    const color = formData.get('color') as string
    const price = formData.get('price') as string
    const description = formData.get(
      'description'
    ) as string

    // Валидация обязательных полей
    if (!model || !storage || !color || !price) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Формируем полное название модели
    const modelName = `${model} ${storage}GB ${color}`

    // Проверяем наличие фото
    photoFiles = []
    let photoIndex = 0
    while (formData.get(`photo_${photoIndex}`)) {
      const photo = formData.get(
        `photo_${photoIndex}`
      ) as File
      if (photo && photo.type.startsWith('image/')) {
        photoFiles.push(photo)
      }
      photoIndex++
    }

    if (photoFiles.length === 0) {
      return NextResponse.json(
        { error: 'Добавьте хотя бы одно фото' },
        { status: 400 }
      )
    }

    // Создаём Supabase клиент с service role key для всех операций
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Генерируем уникальный ID для лота
    lotId = uuidv4()
    uploadedPhotos = []

    // ЭТАП 1: Загружаем фото в Supabase Storage
    console.log(
      `Начинаем загрузку ${photoFiles.length} фото для лота ${lotId}`
    )

    for (let i = 0; i < photoFiles.length; i++) {
      const photo = photoFiles[i]
      const fileExt = photo.name.split('.').pop() || 'jpg'
      const fileName = `${lotId}_${i}.${fileExt}`

      console.log(
        `Загружаем фото ${i + 1}/${
          photoFiles.length
        }: ${fileName}`
      )

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, photo)

      if (uploadError) {
        console.error('Photo upload error:', uploadError)
        return NextResponse.json(
          { error: 'Ошибка загрузки фото' },
          { status: 500 }
        )
      }

      // Получаем публичный URL после успешной загрузки
      const {
        data: { publicUrl },
      } = supabase.storage
        .from('items')
        .getPublicUrl(fileName)

      uploadedPhotos.push(publicUrl)
      console.log(`Фото ${i + 1} загружено: ${publicUrl}`)
    }

    console.log(
      `Все фото загружены. URL-ы: ${uploadedPhotos.join(
        ', '
      )}`
    )

    // ЭТАП 2: Создаём запись в базе данных с ссылками на фото
    console.log(
      `Создаем запись в БД с modelName: ${modelName}`
    )

    const newLot = await prisma.skupka.create({
      data: {
        id: lotId,
        telegramId: telegramId,
        username: telegramId,
        modelname: modelName,
        price: parseInt(price),
        comment: description || null,
        photoUrls: uploadedPhotos,
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log(`Лот успешно создан: ${newLot.id}`)
    return NextResponse.json({
      success: true,
      lot: newLot,
      message: 'Лот успешно создан',
    })
  } catch (error) {
    console.error('Create lot error:', error)

    // Если произошла ошибка, удаляем загруженные фото
    if (uploadedPhotos.length > 0) {
      console.log(
        'Ошибка создания лота, удаляем загруженные фото...'
      )
      const supabase = createClient(
        supabaseUrl,
        supabaseServiceKey
      )

      for (let i = 0; i < photoFiles.length; i++) {
        const fileName = `${lotId}_${i}.${
          photoFiles[i].name.split('.').pop() || 'jpg'
        }`
        try {
          await supabase.storage
            .from('items')
            .remove([fileName])
          console.log(`Удалено фото: ${fileName}`)
        } catch (cleanupError) {
          console.error(
            `Ошибка удаления фото ${fileName}:`,
            cleanupError
          )
        }
      }
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Получаем все лоты
    const { data, error } = await supabase
      .from('Skupka')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Ошибка получения лотов' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      lots: data,
    })
  } catch (error) {
    console.error('Get lots error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
