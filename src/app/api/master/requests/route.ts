import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const masterTelegramId = searchParams.get('masterTelegramId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    if (!masterTelegramId) {
      return NextResponse.json(
        { error: 'Master Telegram ID is required' },
        { status: 400 }
      );
    }

    // Находим мастера по его Telegram ID через Go API
    const masters = await api.list<any>('master', { telegramId: masterTelegramId });
    const master = masters[0];

    if (!master) {
      return NextResponse.json({ success: true, requests: [], total: 0 });
    }

    // В Go API мы добавили поддержку IN через запятую и preload
    const params = {
      assignedMasterId: master.id,
      status: 'submitted,in_progress',
      limit,
      offset,
      order_by: 'createdAt desc',
    };

    const { items: requests, total } = await api.listPaginated<any>('skupka', params);

    return NextResponse.json({
      success: true,
      requests: requests,
      total: total,
    });
  } catch (error) {
    console.error('Error fetching master requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
