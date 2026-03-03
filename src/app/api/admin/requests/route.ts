import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRole } from '@/core/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const hasAccess = await checkRole(adminId, ['ADMIN', 'MANAGER']);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requests = await prisma.repairRequest.findMany({
      include: {
        assignedMaster: true,
        assignedCourier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
