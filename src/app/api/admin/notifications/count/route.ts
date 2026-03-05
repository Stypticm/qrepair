import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) {
    // Silent fail for non-admins — keeps badge hidden
    return NextResponse.json({ count: 0 });
  }

  try {
    const [unreadLeadsCount, newSkupkaCount, newOrdersCount, newTradeInCount] = await Promise.all([
      prisma.quickLead.count({ where: { isRead: false } }),
      prisma.skupka.count({ where: { status: 'submitted' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.tradeInEvaluation.count({ where: { status: 'pending' } }),
    ]);

    const total = unreadLeadsCount + newSkupkaCount + newOrdersCount + newTradeInCount;

    return NextResponse.json({
      count: total,
      leads: unreadLeadsCount,
      skupka: newSkupkaCount,
      orders: newOrdersCount,
      tradeIn: newTradeInCount
    });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ count: 0 });
  }
}
