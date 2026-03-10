import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const [repairs, skupkas, orders] = await Promise.all([
      api.list<any>('repair-requests', { status: 'created' }),
      api.list<any>('skupkas', { status: 'draft' }),
      api.list<any>('orders', { status: 'pending' }),
    ]);

    const newRepairs = (repairs || []).length;
    const newTradeIns = (skupkas || []).length;
    const newOrders = (orders || []).length;

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
