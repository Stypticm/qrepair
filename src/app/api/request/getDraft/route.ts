import { api } from '@/services/api';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');
  
  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID required' },
      { status: 400 }
    );
  }

  try {
    // Ищем последнюю draft заявку пользователя через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const draftRequest = requests[0];

    if (!draftRequest) {
      console.log(
        'No draft found for telegramId:',
        telegramId
      );
      return NextResponse.json(null);
    }

    console.log('Found draft in Go DB:', {
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: draftRequest.price, // Базовая цена
      damagePercent: draftRequest.damagePercent, // Процент скидки
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
    });

    // Вычисляем финальную цену на основе базовой цены и процента скидки
    const basePrice = draftRequest.price || 0;
    const damagePercent = draftRequest.damagePercent || 0;
    const finalPrice = basePrice * (1 - damagePercent / 100);

    // Объединяем дополнительные условия в deviceConditions для обратной совместимости
    let unifiedDeviceConditions: any = draftRequest.deviceConditions || {};
    const legacyAdditional: any = draftRequest.additionalConditions || null;
    if (legacyAdditional) {
      unifiedDeviceConditions = {
        ...unifiedDeviceConditions,
        faceId: legacyAdditional.faceId ?? unifiedDeviceConditions.faceId ?? null,
        touchId: legacyAdditional.touchId ?? unifiedDeviceConditions.touchId ?? null,
        backCamera: legacyAdditional.backCamera ?? unifiedDeviceConditions.backCamera ?? null,
        battery: legacyAdditional.battery ?? unifiedDeviceConditions.battery ?? null,
      };
    }

    // Извлекаем priceRange из deviceConditions
    const priceRange = unifiedDeviceConditions?.priceRange || null;

    // Возвращаем данные заявки с унифицированными условиями
    return NextResponse.json({
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: finalPrice,
      basePrice: basePrice,
      damagePercent: damagePercent,
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      deviceConditions: unifiedDeviceConditions,
      priceRange: priceRange,
      additionalConditions: legacyAdditional,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
      createdAt: draftRequest.createdAt,
      updatedAt: draftRequest.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      );
    }

    // Повторяем логику GET для POST (часто используется в боте)
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const draftRequest = requests[0];

    if (!draftRequest) {
      return NextResponse.json(null);
    }

    const basePrice = draftRequest.price || 0;
    const damagePercent = draftRequest.damagePercent || 0;
    const finalPrice = basePrice * (1 - damagePercent / 100);

    let unifiedDeviceConditions: any = draftRequest.deviceConditions || {};
    const legacyAdditional: any = draftRequest.additionalConditions || null;
    if (legacyAdditional) {
      unifiedDeviceConditions = {
        ...unifiedDeviceConditions,
        faceId: legacyAdditional.faceId ?? unifiedDeviceConditions.faceId ?? null,
        touchId: legacyAdditional.touchId ?? unifiedDeviceConditions.touchId ?? null,
        backCamera: legacyAdditional.backCamera ?? unifiedDeviceConditions.backCamera ?? null,
        battery: legacyAdditional.battery ?? unifiedDeviceConditions.battery ?? null,
      };
    }

    const priceRange = unifiedDeviceConditions?.priceRange || null;

    return NextResponse.json({
      id: draftRequest.id,
      modelname: draftRequest.modelname,
      price: finalPrice,
      basePrice: basePrice,
      damagePercent: damagePercent,
      imei: draftRequest.imei,
      sn: draftRequest.sn,
      deviceConditions: unifiedDeviceConditions,
      priceRange: priceRange,
      additionalConditions: legacyAdditional,
      currentStep: draftRequest.currentStep,
      status: draftRequest.status,
      createdAt: draftRequest.createdAt,
      updatedAt: draftRequest.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
