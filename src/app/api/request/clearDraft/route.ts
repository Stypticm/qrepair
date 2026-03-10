import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function DELETE(request: NextRequest) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const { count } = await RequestManager.clearDraft(telegramId.toString());

    console.log(
      `Deleted ${count} requests for telegramId: ${telegramId}`
    );

    return NextResponse.json({
      success: true,
      deletedCount: count,
    });
  } catch (error) {
    console.error('Error clearing draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
