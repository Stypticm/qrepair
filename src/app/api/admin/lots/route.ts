import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/core/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  let lotId: string = ''
  let uploadedPhotos: string[] = []
  let photoFiles: File[] = []

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Конфигурация Supabase не задана' }, { status: 500 })
    }

    const formData = await request.formData()
    const model = formData.get('model') as string
    const storage = formData.get('storage') as string
    const color = formData.get('color') as string
    const price = formData.get('price') as string
    const description = formData.get('description') as string

    if (!model || !storage || !color || !price) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    const modelName = `${model} ${storage}GB ${color}`

    photoFiles = []
    let photoIndex = 0
    while (formData.get(`photo_${photoIndex}`)) {
      const photo = formData.get(`photo_${photoIndex}`) as File
      if (photo && photo.type.startsWith('image/')) photoFiles.push(photo)
      photoIndex++
    }

    if (photoFiles.length === 0) {
      return NextResponse.json({ error: 'Добавьте хотя бы одно фото' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    lotId = uuidv4()
    uploadedPhotos = []

    for (let i = 0; i < photoFiles.length; i++) {
      const photo = photoFiles[i]
      const fileExt = photo.name.split('.').pop() || 'jpg'
      const fileName = `${lotId}_${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('items').upload(fileName, photo)
      if (uploadError) return NextResponse.json({ error: 'Ошибка загрузки фото' }, { status: 500 })

      const { data: { publicUrl } } = supabase.storage.from('items').getPublicUrl(fileName)
      uploadedPhotos.push(publicUrl)
    }

    const newLot = await prisma.skupka.create({
      data: {
        id: lotId,
        telegramId: auth.user.telegramId,
        username: 'admin_panel',
        modelname: modelName,
        price: parseInt(price),
        comment: description || null,
        photoUrls: uploadedPhotos,
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, lot: newLot, message: 'Лот успешно создан' })
  } catch (error) {
    console.error('Create lot error:', error)
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
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: lots, error } = await createClient(supabaseUrl, supabaseServiceKey)
      .from('Skupka')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Ошибка получения лотов' }, { status: 500 })

    return NextResponse.json({ success: true, lots })
  } catch (error) {
    console.error('Get lots error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
