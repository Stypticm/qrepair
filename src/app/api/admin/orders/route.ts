import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: any = {}
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { lot: true } }, pickupPoint: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
