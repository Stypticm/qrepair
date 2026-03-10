import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('=== SUBMIT-FINAL REQUEST ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('============================');

    const {
      telegramId,
      username,
      modelname,
      price,
      priceRange,
      deliveryData,
      videoUrls,
    } = requestBody;

    if (!telegramId || !modelname) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      );
    }

    // Находим активную заявку через Go API
    const activeRequest = await RequestManager.getOrCreateActiveRequest(telegramId, {
      username: username || 'Unknown',
      modelname: modelname,
    });

    // Получаем адрес точки
    const pickupPointAddress = deliveryData?.pickupPoint || activeRequest.pickupPoint || 'Адрес не указан';

    // Обновляем заявку как завершенную
    const updatedRequest = await api.patch<any>('skupka', activeRequest.id, {
      priceAgreed: true,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      pickupPoint: pickupPointAddress,
      deliveryMethod: deliveryData?.deliveryMethod || 'pickup',
      courier: deliveryData?.deliveryMethod === 'courier'
        ? deliveryData?.courier || null
        : null,
      priceRange: priceRange || undefined,
      videoUrls: Array.isArray(videoUrls) ? videoUrls : undefined,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      requestId: updatedRequest.id,
    });
  } catch (error) {
    console.error('Ошибка при финальной отправке заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
