import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const data = await request.json();

    // Fetch current product to compare prices
    const currentProduct = await api.get<any>('marketplace-lots', id, undefined, headers);
    
    // Automatically set oldPrice if price has changed
    if (currentProduct && currentProduct.price !== undefined && data.price !== undefined) {
      if (currentProduct.price !== data.price) {
        data.oldPrice = currentProduct.price;
      }
    }

    const updated = await api.update('marketplace-lots', id, data, headers);
    return NextResponse.json({ success: true, lot: updated });
  } catch (error: any) {
    console.error('Update lot error:', error);
    return NextResponse.json({ error: error.message || 'Error updating product' }, { status: 500 });
  }
}
