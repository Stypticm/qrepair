import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown = null;
  try {
    body = await req.json();
  } catch (_) {
    // empty body allowed
  }
  const maybeObj =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {};
  const maybePrice = maybeObj.price;

  if (!id) {
    return NextResponse.json(
      { error: 'Missing request ID' },
      { status: 400 }
    );
  }

  try {
    const request = await api.get<any>('skupkas', id);

    if (!request || request.status !== 'accepted') {
      return NextResponse.json(
        { error: 'No accepted request found' },
        { status: 404 }
      );
    }

    // Обновляем статус и фиксируем окончательную цену (если передана)
    const dataToUpdate: Record<string, unknown> = {
      status: 'in_progress',
      priceConfirmed: false,
      updatedAt: new Date().toISOString(),
    };
    
    if (
      maybePrice !== undefined &&
      maybePrice !== null &&
      !Number.isNaN(Number(maybePrice))
    ) {
      dataToUpdate.price = Number(maybePrice);
    }

    const updatedRequest = await api.patch<any>('skupkas', id, dataToUpdate);

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    });
  } catch (error) {
    console.error('Error in acceptRequest:', error);
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    );
  }
}
