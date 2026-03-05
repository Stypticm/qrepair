import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId, newPointId, newMasterId } = await req.json()

    if (!requestId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const request = await prisma.skupka.findUnique({ where: { id: requestId } })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: { pickupPoint: newPointId?.toString(), assignedMasterId: newMasterId },
    })

    if (newMasterId) {
      const master = await prisma.master.findUnique({ where: { id: newMasterId } })
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
