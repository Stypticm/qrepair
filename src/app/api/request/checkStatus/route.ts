import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { error: 'Empty body' },
        { status: 400 }
      );
    }
    const { telegramId } = JSON.parse(text);

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID required' },
        { status: 400 }
      );
    }

    // Проверяем существование активной заявки через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const activeRequest = requests[0];

    if (!activeRequest) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'No active request found',
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      request: {
        id: activeRequest.id,
        status: activeRequest.status,
        currentStep: activeRequest.currentStep,
        updatedAt: activeRequest.updatedAt,
      },
    });
  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
