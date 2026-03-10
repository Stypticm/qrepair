import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, minPrice, maxPrice } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await api.patch('trade-in-evaluations', id, {
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
