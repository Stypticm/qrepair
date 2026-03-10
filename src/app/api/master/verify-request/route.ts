import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      );
    }

    // Убираем # из ID если есть
    const cleanId = requestId.replace('#', '');

    // Ищем заявку по ID (последние символы) через Go API с поддержкой LIKE
    const requests = await api.list<any>('skupka', {
      'id_like': cleanId,
      'status': 'submitted',
    });

    const skupka = requests[0];

    if (!skupka) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        id: skupka.id,
        modelname: skupka.modelname,
        price: skupka.price,
        pickupPoint: skupka.pickupPoint,
        courierAddress: (skupka.courier || {}).address || null,
        deliveryMethod: skupka.deliveryMethod,
      },
    });
  } catch (error) {
    console.error('Error verifying request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
