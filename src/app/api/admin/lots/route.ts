import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  let lotId: string = uuidv4()
  let uploadedPhotos: string[] = []
  let photoFiles: File[] = []

  try {
    const formData = await request.formData()
    const model = formData.get('model') as string
    const storage = formData.get('storage') as string
    const color = formData.get('color') as string
    const price = formData.get('price') as string
    const description = formData.get('description') as string
    const isAccessory = formData.get('isAccessory') as string === 'true'
    const targetBrand = formData.get('targetBrand') as string
    const targetModel = formData.get('targetModel') as string
    const modelName = formData.get('modelName') as string || (isAccessory ? model : `${model} ${storage}GB ${color}`)

    if (!model || !price) {
      return NextResponse.json({ error: 'Заполните обязательные поля (Модель и Цена)' }, { status: 400 })
    }

    if (!isAccessory && (!storage || !color)) {
      return NextResponse.json({ error: 'Для смартфона нужны память и цвет' }, { status: 400 })
    }

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

    const telegramIdHeader = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true'
    };
    if (telegramIdHeader) headers['x-telegram-id'] = telegramIdHeader;
    if (authHeader) headers['authorization'] = authHeader;

    // Загружаем фото напрямую в наш Go API (локальное хранилище)
    uploadedPhotos = []
    for (const file of photoFiles) {
      // Используем метод upload из нашего сервиса
      const uploadResult = await api.upload(file, { 
        ...headers,
        'folder': 'lots' 
      });
      if (uploadResult && uploadResult.url) {
        uploadedPhotos.push(uploadResult.url)
      }
    }

    const status = formData.get('status') as string || 'available'
    const brand = formData.get('brand') as string || (model.split(' ')[0])
    const oldPrice = formData.get('oldPrice') as string
    
    // Генерируем артикул (SKU) автоматически
    const shortId = uuidv4().split('-')[0].toUpperCase()
    const safeModel = model.replace(/\s+/g, '').toUpperCase()
    const sku = `${brand.toUpperCase()}-${safeModel}-${storage || 'ACC'}-${shortId}`.toUpperCase()

    const payload = {
      id: lotId,
      sku: sku,
      title: modelName,
      brand: brand,
      model: model,
      storage: isAccessory ? '0' : storage,
      color: isAccessory ? 'Accessory' : color,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      description: description || null,
      photos: uploadedPhotos,
      coverPhoto: uploadedPhotos[0] || '',
      status: status,
      telegramId: auth.user.telegramId,
      isAccessory: isAccessory,
      targetBrand: targetBrand || null,
      targetModel: targetModel || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('Sending creation payload to Go API (Local Storage):', JSON.stringify(payload, null, 2))

    // Сохранение в новую БД через наш Go API
    const newLot = await api.create('marketplace-lots', payload, headers)

    return NextResponse.json({ success: true, lot: newLot, message: 'Лот успешно создан' })
  } catch (error: any) {
    console.error('Create lot error:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера', 
      details: error.message || String(error) 
    }, { status: 500 })
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
