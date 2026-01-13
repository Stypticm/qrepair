import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';

const ADMIN_IDS = [1, 296925626, 531360988]; // The source of truth for admin IDs

export async function POST(request: NextRequest) {
  try {
    const { requestId, masterId, adminTelegramId } = await request.json();

    if (!requestId || !masterId || !adminTelegramId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify admin privileges by checking against the hardcoded list
    if (!ADMIN_IDS.includes(parseInt(adminTelegramId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the request with the new master
    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        assignedMasterId: masterId,
        status: 'accepted', // Automatically update status to 'accepted'
      },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Error assigning request:', error);
    return NextResponse.json(
      { error: 'Failed to assign request' },
      { status: 500 }
    );
  }
}