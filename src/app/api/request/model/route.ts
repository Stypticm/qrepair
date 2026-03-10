import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, modelname } = body;

    if (!telegramId || !modelname?.trim()) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Используем RequestManager (теперь работает через Go API)
    const updated = await RequestManager.updateActiveRequest(telegramId, {
      modelname: modelname.trim(),
      currentStep: 'form',
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('API /model error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
