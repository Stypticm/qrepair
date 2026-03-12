import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
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
