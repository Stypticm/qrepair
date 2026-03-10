import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      username,
      modelname,
      price,
      deliveryMethod,
      pickupPoint,
      courier, // { address, date, time, method, confirmed, courierId }
    } = await request.json();

    console.log('🔍 Submit-delivery API received:', {
      telegramId,
      username,
      modelname,
      price,
      deliveryMethod,
      pickupPoint,
      courier,
    });

    if (!telegramId || !modelname || !deliveryMethod) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      modelname: modelname,
      price: price || undefined,
      priceAgreed: true,
      deliveryMethod: deliveryMethod,
    };

    if (deliveryMethod === 'pickup') {
      updateData.pickupPoint = pickupPoint;
      updateData.courier = null;
    } else if (deliveryMethod === 'courier') {
      updateData.courier = courier || null;
      updateData.pickupPoint = null;
    }

    // Используем RequestManager (который теперь работает через Go API)
    const updatedRequest = await RequestManager.updateActiveRequest(telegramId, {
      ...updateData,
      username: username || 'Unknown',
    });

    // Сохраняем данные в sessionStorage для финальной страницы
    const deliveryData = {
      deliveryMethod,
      pickupPoint: deliveryMethod === 'pickup' ? pickupPoint : null,
      courier: deliveryMethod === 'courier' ? courier || null : null,
    };

    return NextResponse.json({
      success: true,
      deliveryData,
    });
  } catch (error) {
    console.error(
      'Ошибка при сохранении данных доставки:',
      error
    );
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
