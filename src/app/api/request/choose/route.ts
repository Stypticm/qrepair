import { RequestManager } from '@/core/lib/requestManager';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      telegramId,
      username,
      price,
      imei,
      sn,
      currentStep,
      modelname,
    } = body;

    console.log('🔍 API /choose - получены данные:', {
      telegramId,
      username,
      price,
      imei,
      sn,
      currentStep,
      modelname,
    });

    if (!username) username = 'local_dev';
    if (!telegramId) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Используем RequestManager (который теперь работает через Go API)
    const updated = await RequestManager.updateActiveRequest(telegramId, {
      username,
      price: price !== undefined ? price : undefined,
      imei,
      sn,
      currentStep,
      modelname,
    });

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    console.error('Ошибка в API /choose:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
