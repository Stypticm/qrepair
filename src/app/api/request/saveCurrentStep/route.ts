import { NextRequest, NextResponse } from 'next/server';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, currentStep } = await request.json();

    if (!telegramId || !currentStep) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Обновляем текущий шаг в активной заявке через Go API
    const updatedRequest = await RequestManager.updateActiveRequest(telegramId, {
      currentStep: currentStep,
    });

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Active request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      currentStep: currentStep,
    });
  } catch (error) {
    console.error('Error saving current step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
