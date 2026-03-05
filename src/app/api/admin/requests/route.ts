import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const requests = await prisma.repairRequest.findMany({
      include: { assignedMaster: true, assignedCourier: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
