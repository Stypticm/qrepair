import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  let lotId: string = ''
  let uploadedPhotos: string[] = []
  let photoFiles: File[] = []

  try {
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

    // Фото пока загружаем в Supabase Storage (как просил пользователь - оставить Auth/Storage)
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

    const telegramIdHeader = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramIdHeader) headers['x-telegram-id'] = telegramIdHeader;
    if (authHeader) headers['authorization'] = authHeader;

    const status = formData.get('status') as string || 'available'
    const brand = formData.get('brand') as string || (model.split(' ')[0])
    const oldPrice = formData.get('oldPrice') as string
    
    // Генерируем артикул (SKU) автоматически: BRAND-MODEL-STORAGE-COLOR-SHORTID
    const shortId = uuidv4().split('-')[0].toUpperCase()
    const sku = `${brand}-${model.replace(/\s+/g, '')}-${storage}-${color.replace(/\s+/g, '')}-${shortId}`.toUpperCase()

    // Сохранение в новую БД через наш Go API
    const newLot = await api.create('marketplace-lots', {
      id: lotId,
      sku: sku,
      title: modelName,
      brand: brand,
      model: model,
      storage: storage,
      color: color,
      price: parseInt(price),
      oldPrice: oldPrice ? parseInt(oldPrice) : null,
      description: description || null,
      photos: uploadedPhotos,
      coverPhoto: uploadedPhotos[0],
      status: status,
      telegramId: auth.user.telegramId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, headers)

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
    const telegramIdHeader = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramIdHeader) headers['x-telegram-id'] = telegramIdHeader;
    if (authHeader) headers['authorization'] = authHeader;

    // Получение через наш Go API
    const items = await api.list<any>('marketplace-lots', { limit: 100 }, headers);

    return NextResponse.json({ success: true, lots: items })
  } catch (error: any) {
    console.error('Get lots error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
