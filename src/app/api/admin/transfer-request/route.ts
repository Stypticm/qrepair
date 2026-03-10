import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId, newPointId, newMasterId } = await req.json()

    if (!requestId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const skupkaRequest = await api.get<any>('skupkas', requestId)

    if (!skupkaRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updatedRequest = await api.patch('skupkas', requestId, {
      pickupPoint: newPointId?.toString(),
      assignedMasterId: newMasterId,
    })

    if (newMasterId) {
      const masters = await api.list<any>('masters', { id: newMasterId })
      const master = masters && masters.length > 0 ? masters[0] : null
      if (master) {
        console.log(`Sending notification to master ${master.telegramId} about transferred request`)
      }
    }

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error('Error transferring request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
