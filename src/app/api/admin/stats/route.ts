import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/core/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const [newRepairs, newTradeIns, newOrders] = await Promise.all([
      prisma.repairRequest.count({ where: { status: 'created' } }),
      prisma.skupka.count({ where: { status: 'draft' } }),
      prisma.order.count({ where: { status: 'pending' } })
    ]);

    return NextResponse.json({
      metrics: {
        totalNew: newRepairs + newTradeIns + newOrders,
        repairs: newRepairs,
        tradeIns: newTradeIns,
        orders: newOrders,
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
