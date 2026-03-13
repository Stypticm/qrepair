import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { checkAdminAccessFromDB } from '@/core/lib/admin-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await checkAdminAccessFromDB(telegramId);
    if (!hasAccess && role !== 'MASTER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ищем мастера по telegramId
    const mastersList = await api.list<any>('masters', { telegramId });
    if (!mastersList || mastersList.length === 0) {
      return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
    }
    
    const master = mastersList[0];

    const updates = {
      assignedMasterId: master.id,
      updatedAt: new Date().toISOString(),
    };

    const result = await api.patch<any>('repair-requests', id, updates);

    return NextResponse.json({ success: true, request: result });
  } catch (error) {
    console.error('Error taking repair request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
