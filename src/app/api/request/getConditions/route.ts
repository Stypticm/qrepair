import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    // Получаем telegramId из body
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      );
    }

    // Ищем активную заявку через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft,submitted',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const activeRequest = requests[0];

    if (activeRequest) {
      const response = NextResponse.json({
        success: true,
        deviceConditions: activeRequest.deviceConditions || null,
        modelname: activeRequest.modelname,
        deviceData: activeRequest.deviceData,
        price: activeRequest.price,
        status: activeRequest.status,
      });

      // Отключаем кэширование
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    } else {
      const response = NextResponse.json({
        success: true,
        deviceConditions: null,
      });

      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    }
  } catch (error) {
    console.error('API /getConditions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
