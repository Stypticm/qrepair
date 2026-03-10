import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Missing request ID' },
      { status: 400 }
    );
  }

  try {
    const request = await api.get<any>('skupkas', id);

    if (!request || request.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'No in_progress request found' },
        { status: 404 }
      );
    }

    // Разрешаем переход дальше только при подтверждённой цене
    if (!request.price || !request.priceConfirmed) {
      return NextResponse.json(
        { error: 'Price is not confirmed by user yet' },
        { status: 400 }
      );
    }

    // Обновляем только статус. Цена на этом шаге не меняется
    const updatedRequest = await api.patch<any>('skupkas', id, {
      status: 'on_the_way',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    });
  } catch (error) {
    console.error('Error in reviewRequest:', error);
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    );
  }
}
