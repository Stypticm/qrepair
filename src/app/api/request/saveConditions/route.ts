import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из запроса
    const {
      deviceConditions,
      price: _price,
      basePrice,
      discountPercent,
      currentStep,
      telegramId,
      username,
    } = await request.json();

    console.log(
      '🔍 API /saveConditions - получены данные:',
      {
        deviceConditions,
        basePrice,
        discountPercent,
        currentStep,
        telegramId,
      }
    );

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      );
    }

    // Находим или создаем активную заявку через Go API
    const activeRequest = await RequestManager.getOrCreateActiveRequest(telegramId, {
      username: username || 'Unknown',
    });

    // Объединяем текущие состояния с новыми
    const currentConditions = activeRequest.deviceConditions || {};
    const mergedConditions = {
      ...currentConditions,
      ...deviceConditions,
    };

    const updateData = {
      deviceConditions: mergedConditions,
      price: basePrice || undefined, // Базовая цена без поломок
      damagePercent: discountPercent || 0, // Процент скидки за поломки
      currentStep: currentStep || undefined, // Сохраняем текущий шаг
    };

    console.log(
      '🔄 API /saveConditions - обновляем запись через Go API:',
      {
        id: activeRequest.id,
        updateData,
      }
    );

    const updatedRequest = await RequestManager.updateActiveRequest(telegramId, updateData);

    console.log(
      '✅ API /saveConditions - запись обновлена:',
      {
        id: updatedRequest.id,
        price: updatedRequest.price,
        damagePercent: updatedRequest.damagePercent,
        deviceConditions: updatedRequest.deviceConditions,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Состояния устройства сохранены',
      requestId: updatedRequest.id,
    });
  } catch (error) {
    console.error('API /saveConditions error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
