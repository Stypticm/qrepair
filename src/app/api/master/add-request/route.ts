import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
  try {
    const { requestId, masterTelegramId } = await req.json();

    if (!requestId || !masterTelegramId) {
      return NextResponse.json(
        {
          error: 'Request ID and Master Telegram ID are required',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли заявка через Go API
    const request = await api.get<any>('skupka', requestId);

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Проверяем, является ли пользователь мастером через Go API
    const masters = await api.list<any>('master', { telegramId: masterTelegramId });
    const master = masters[0];

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      );
    }

    // Обновляем заявку, назначая её мастеру через Go API
    const updatedRequest = await api.patch<any>('skupka', requestId, {
      assignedMasterId: master.id,
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error adding request to master:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
