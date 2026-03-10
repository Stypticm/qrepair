import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { masterTelegramId } = body || {};

    let masterId = masterTelegramId;

    // Если передан Telegram ID, нам нужно найти соответствующий UUID мастера
    if (masterTelegramId && masterTelegramId.length > 10) { // Предполагаем что UUID длиннее чем Telegram ID или наоборот
      // На самом деле Telegram ID обычно короче, а UUID/CUID длиннее.
      // В любом случае, лучше всегда пытаться найти мастера если это Telegram ID.
      const masters = await api.list<any>('master', { telegramId: masterTelegramId });
      if (masters.length > 0) {
        masterId = masters[0].id;
      }
    }

    const updated = await api.patch<any>('skupka', requestId, {
      status: 'paid',
      ...(masterId ? { assignedMasterId: masterId } : {}),
    });

    return NextResponse.json({
      success: true,
      request: updated,
    });
  } catch (error: any) {
    console.error('Error marking paid:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to mark as paid' },
      { status: 500 }
    );
  }
}
