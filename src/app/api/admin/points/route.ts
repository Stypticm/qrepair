import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const points = await prisma.point.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
