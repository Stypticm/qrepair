import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      username,
      additionalConditions,
      currentStep,
    } = await request.json();

    console.log(
      '[saveAdditionalConditions] Получены данные:',
      {
        telegramId,
        username,
        additionalConditions,
        currentStep,
      }
    );

    if (!telegramId || !additionalConditions) {
      console.error(
        '[saveAdditionalConditions] Отсутствуют обязательные поля:',
        { telegramId, additionalConditions }
      );
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Находим или создаем активную заявку пользователя через Go API
    const activeRequest = await RequestManager.getOrCreateActiveRequest(telegramId, {
      username: username || 'Unknown',
      currentStep: currentStep || 'additional-condition',
    });

    // Объединяем в deviceConditions
    const mergedDeviceConditions = {
      ...(activeRequest.deviceConditions || {}),
      ...(additionalConditions || {}),
    };

    console.log(
      '[saveAdditionalConditions] Обновляем заявку с данными через Go API:',
      {
        telegramId,
        mergedConditions: mergedDeviceConditions,
        currentStep,
      }
    );

    // Обновляем заявку с новыми условиями (в deviceConditions)
    const updatedRequest = await RequestManager.updateActiveRequest(telegramId, {
      deviceConditions: mergedDeviceConditions,
      additionalConditions: null, // чистим legacy
      currentStep: currentStep || undefined,
    });

    return NextResponse.json({
      success: true,
      deviceConditions: mergedDeviceConditions,
      requestId: updatedRequest.id,
    });
  } catch (error) {
    console.error(
      '[saveAdditionalConditions] Ошибка при сохранении:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
