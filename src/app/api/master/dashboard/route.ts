import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');
    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Получаем список запросов и точек напрямую через Go API
    const [requestsData, masters] = await Promise.all([
      api.listPaginated<any>('skupka', { 
        assignedMasterId: telegramId, // Go API handles finding by telegramId if we set up relations correctly or if we pass it as a filter
        // Wait, normally it should be filtered by Master ID. 
        // But our Go Repository.GetAll for skupka might need to handle masterTelegramId if we want to filter by it.
        // For now I'll assume it finds the master first if needed, but since I already migrated requests/route.ts,
        // I know it finds the master first.
      }),
      api.list<any>('master', { telegramId, preload: 'Point' })
    ]);

    // Находим мастера чтобы получить его UUID если в dashboard нужно именно по UUID
    const master = masters[0];
    const masterId = master?.id;

    // Повторяем логику из master/requests/route.ts если нужно фильтровать по ID
    let finalRequests = [];
    let total = 0;
    
    if (masterId) {
      const paginated = await api.listPaginated<any>('skupka', {
        assignedMasterId: masterId,
        status: 'submitted,in_progress',
        limit: 10,
        order_by: 'createdAt desc',
      });
      finalRequests = paginated.items;
      total = paginated.total;
    }

    const points = master?.point ? [master.point] : [];

    // Обрезаем поля до нужного минимума
    const requests = finalRequests.map((r: any) => ({
      id: r.id,
      modelname: r.modelname,
      price: r.price,
      username: r.username,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      requests,
      points,
      allPoints: points,
    });
  } catch (e: any) {
    console.error('Master dashboard error:', e);
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
