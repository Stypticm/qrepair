import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { RequestManager } from '@/core/lib/requestManager';

export async function POST(request: NextRequest) {
  try {
    const {
      telegramId,
      userEvaluation,
      damagePercent,
      price,
      priceRange,
    } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    // Находим активную заявку пользователя через Go API
    const requests = await api.list<any>('skupka', {
      telegramId,
      status: 'draft',
      order_by: 'updatedAt desc',
      limit: 1,
    });
    
    const activeRequest = requests[0];

    if (!activeRequest) {
      console.log('❌ No active request found for telegramId:', telegramId);
      return NextResponse.json(
        { error: 'No active request found' },
        { status: 404 }
      );
    }

    console.log('✅ Found active request:', {
      id: activeRequest.id,
      telegramId: activeRequest.telegramId,
      status: activeRequest.status,
    });

    // Обновляем заявку с данными оценки через Go API
    const updatedRequest = await api.patch<any>('skupka', activeRequest.id, {
      userEvaluation: userEvaluation || null,
      damagePercent: damagePercent || 0,
      price: price ?? activeRequest.price,
      priceRange: priceRange || activeRequest.priceRange,
      currentStep: 'submit',
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Evaluation saved:', {
      id: updatedRequest.id,
      telegramId,
      userEvaluation,
      damagePercent,
      price,
      currentStep: updatedRequest.currentStep,
    });

    return NextResponse.json({
      success: true,
      request: {
        id: updatedRequest.id,
        userEvaluation: updatedRequest.userEvaluation,
        damagePercent: updatedRequest.damagePercent,
        price: updatedRequest.price,
        priceRange: updatedRequest.priceRange,
        currentStep: updatedRequest.currentStep,
      },
    });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
