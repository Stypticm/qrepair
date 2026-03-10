import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId, masterId } = await request.json();

    if (!requestId || !masterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedRequest = await api.patch<any>('skupkas', requestId, {
        assignedMasterId: masterId,
        status: 'accepted',
        updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Error assigning request:', error);
    return NextResponse.json({ error: 'Failed to assign request' }, { status: 500 });
  }
}