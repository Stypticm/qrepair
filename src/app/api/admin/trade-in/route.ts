import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const evaluations = await prisma.tradeInEvaluation.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching trade-in evaluations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
