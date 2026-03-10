import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'TelegramId is required' },
        { status: 400 }
      );
    }

    // Ищем активную заявку пользователя через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft,submitted',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const activeRequest = requests[0];

    if (activeRequest) {
      return NextResponse.json({
        deviceConditions: activeRequest.deviceConditions || null,
        status: activeRequest.status,
      });
    } else {
      return NextResponse.json({
        deviceConditions: null,
        status: null,
      });
    }
  } catch (error) {
    console.error('API /getAdditionalConditions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
