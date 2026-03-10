import { api } from '@/services/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      );
    }

    // Ищем существующую заявку через Go API
    const requests = await api.list<any>('skupka', { 
      telegramId,
      status: 'draft,submitted',
      order_by: 'updatedAt desc',
      limit: 1
    });
    
    const existingRequest = requests[0];

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      price: existingRequest.price,
    });
  } catch (error) {
    console.error('getPrice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
