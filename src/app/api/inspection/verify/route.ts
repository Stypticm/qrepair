import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skupkaId, masterUsername, inspectionToken } = body;

    if (!skupkaId || !masterUsername || !inspectionToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Проверяем токен через Go API
    const inspections = await api.list<any>('device-inspections', {
      skupkaId,
      masterUsername,
      inspectionToken,
    });
    
    const inspection = inspections[0];

    if (!inspection || new Date(inspection.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Получаем связанные данные заявки
    const skupka = await api.get<any>('skupkas', skupkaId);
    if (!skupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Ищем мастера в Go API
    const masters = await api.list<any>('masters', { username: masterUsername });
    const master = masters[0];

    if (!master) {
      return NextResponse.json({ error: 'Master not found' }, { status: 404 });
    }

    // Проверяем назначение мастера
    const assignedTelegramId = (skupka.courier || {}).telegramId;
    if (assignedTelegramId !== master.telegramId) {
      return NextResponse.json(
        { error: 'Master not assigned to this request' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        skupkaId: inspection.skupkaId,
        masterUsername: inspection.masterUsername,
        testsResults: inspection.testsResults,
        finalPrice: inspection.finalPrice,
        inspectionNotes: inspection.inspectionNotes,
        completedAt: inspection.completedAt,
        createdAt: inspection.createdAt,
      },
      skupka: {
        id: skupka.id,
        modelname: skupka.modelname,
        price: skupka.price,
        status: skupka.status,
      },
    });
  } catch (error) {
    console.error('Error verifying inspection:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
