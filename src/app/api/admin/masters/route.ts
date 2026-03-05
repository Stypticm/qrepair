import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const masters = await prisma.master.findMany({
      include: { point: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ masters })
  } catch (error) {
    console.error('Error fetching masters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
