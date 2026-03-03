import { checkRole } from '@/core/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

export async function POST(request: NextRequest) {
  let lotId: string = ''
  let uploadedPhotos: string[] = []
  let photoFiles: File[] = []

  try {
    // Валидация переменных окружения
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('ENV validation failed', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
      })
      return NextResponse.json(
        {
          error: 'Конфигурация Supabase не задана: проверьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 500 }
      )
    }

    // Проверяем права доступа
    const telegramId = request.headers.get('x-telegram-id')
    const hasAccess = await checkRole(telegramId, ['ADMIN', 'MANAGER'])

    if (!hasAccess) {
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
    const description = formData.get('description') as string

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
      const photo = formData.get(`photo_${photoIndex}`) as File
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

    // Создаём Supabase клиент
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    lotId = uuidv4()
    uploadedPhotos = []

    // ЭТАП 1: Загружаем фото
    for (let i = 0; i < photoFiles.length; i++) {
      const photo = photoFiles[i]
      const fileExt = photo.name.split('.').pop() || 'jpg'
      const fileName = `${lotId}_${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(fileName, photo)

      if (uploadError) {
        console.error('Photo upload error:', uploadError)
        return NextResponse.json({ error: 'Ошибка загрузки фото' }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(fileName)

      uploadedPhotos.push(publicUrl)
    }

    // ЭТАП 2: Создаём запись в БД (в модели Skupka как лот)
    const newLot = await prisma.skupka.create({
      data: {
        id: lotId,
        telegramId: telegramId || 'admin',
        username: 'admin_panel',
        modelname: modelName,
        price: parseInt(price),
        comment: description || null,
        photoUrls: uploadedPhotos,
        status: 'paid', // статус для отображения в каталоге (админские лоты)
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      lot: newLot,
      message: 'Лот успешно создан',
    })
  } catch (error) {
    console.error('Create lot error:', error)
    // Очистка при ошибке
    if (uploadedPhotos.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      for (let i = 0; i < photoFiles.length; i++) {
        const fileName = `${lotId}_${i}.${photoFiles[i].name.split('.').pop() || 'jpg'}`
        await supabase.storage.from('items').remove([fileName])
      }
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')
    const hasAccess = await checkRole(telegramId, ['ADMIN', 'MANAGER'])

    if (!hasAccess) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { data: lots, error } = await createClient(supabaseUrl, supabaseServiceKey)
      .from('Skupka')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ error: 'Ошибка получения лотов' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lots })
  } catch (error) {
    console.error('Get lots error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
