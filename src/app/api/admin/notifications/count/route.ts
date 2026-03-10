import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) {
    // Silent fail for non-admins — keeps badge hidden
    return NextResponse.json({ count: 0 });
  }

  try {
    const [unreadLeads, newSkupka, newOrders, newTradeIn] = await Promise.all([
      api.list<any>('quick-leads', { isRead: 'false' }),
      api.list<any>('skupkas', { status: 'submitted' }),
      api.list<any>('orders', { status: 'pending' }),
      api.list<any>('trade-in-evaluations', { status: 'pending' }),
    ]);

    const unreadLeadsCount = unreadLeads.length;
    const newSkupkaCount = newSkupka.length;
    const newOrdersCount = newOrders.length;
    const newTradeInCount = newTradeIn.length;

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
