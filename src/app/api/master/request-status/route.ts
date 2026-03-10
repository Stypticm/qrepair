import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status, masterTelegramId } = body;

    if (!requestId || !status || !masterTelegramId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Проверяем, что мастер существует через Go API
    const masters = await api.list<any>('master', { telegramId: masterTelegramId });
    const master = masters[0];

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      );
    }

    // Проверяем, что заявка существует и назначена этому мастеру через Go API
    const existingRequest = await api.get<any>('skupka', requestId);

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (existingRequest.assignedMasterId !== master.id) {
      return NextResponse.json(
        {
          error: 'Access denied - request not assigned to this master',
        },
        { status: 403 }
      );
    }

    // Обновляем статус заявки через Go API
    const updatedRequest = await api.patch<any>('skupka', requestId, {
      status: status,
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
