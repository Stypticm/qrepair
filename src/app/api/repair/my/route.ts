import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const idsParam = searchParams.get('ids');

    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      const repairs = await Promise.all(
        ids.map(async (id) => {
          try {
            return await api.get<any>('repair-requests', id);
          } catch {
            return null;
          }
        })
      );
      return NextResponse.json(repairs.filter(Boolean));
    }

    if (!telegramId) {
      return NextResponse.json([]);
    }

    const repairs = await api.list<any>('repair-requests', {
      telegramId,
      _sort: 'createdAt',
      _order: 'desc',
    });

    return NextResponse.json(repairs);
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
