import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { deliveryAddress, address, deliveryDate, deliveryTime, courierId, status } = body;

    const data: any = {};
    if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;
    if (address !== undefined) data.deliveryAddress = address;
    if (deliveryDate !== undefined) data.deliveryDate = deliveryDate ? new Date(deliveryDate).toISOString() : null;
    if (deliveryTime !== undefined) data.deliveryTime = deliveryTime;
    if (status !== undefined) data.status = status;
    if (courierId !== undefined) {
      data.courierId = courierId || null; // Update courierId directly
    }
    data.updatedAt = new Date().toISOString();

    const updatedOrder = await api.patch<any>('orders', id, data);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[OrderUpdate] Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
