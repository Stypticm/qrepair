import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      username,
      feedback,
      modelname,
      price,
    } = await request.json();

    if (!telegramId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Saving feedback via Go API:', {
      telegramId,
      feedback,
      modelname,
      price,
    });

    // Находим или создаем активную заявку через RequestManager (Go API)
    const activeRequest = await RequestManager.getOrCreateActiveRequest(telegramId, {
      username: username || 'Unknown',
      modelname: modelname,
      price: price,
    });

    // Обновляем заявку с feedback и меняем статус на submitted
    const updatedSkupka = await api.patch<any>('skupka', activeRequest.id, {
      feedback: feedback.trim(),
      priceAgreed: false, // Пользователь не согласен с ценой
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

    console.log('Updated skupka with feedback via Go API:', updatedSkupka.id);

    return NextResponse.json({
      success: true,
      skupka: updatedSkupka,
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
