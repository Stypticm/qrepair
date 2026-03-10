import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, phone, address, deliveryDate, deliveryTime, items, totalPrice } = body;

    if (!phone || !name) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 });
    }

    if (items && items.length > 0) {
      // NOTE: Go API might not map nested creates identically to Prisma.
      // Assuming the Go backend can accept `items` as an array of objects to create OrderItems
      // or we might need to create the order first, then items sequentially. We will assume nested creation works or is handled by Go.
      const order = await api.create<any>('orders', {
          telegramId: phone,
          deliveryMethod: 'courier',
          deliveryAddress: address || 'Ручное создание',
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          deliveryTime: deliveryTime || null,
          status: 'pending',
          totalPrice: totalPrice || 0,
          items: items.map((item: any) => ({ title: item.title, price: item.price, lotId: item.lotId })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      });
      return NextResponse.json({ success: true, orderId: order.id });
    } else {
      const lead = await api.create<any>('quick-leads', {
          name,
          phone,
          address: address || 'Ручное создание',
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          deliveryTime: deliveryTime || null,
          status: 'new',
          productTitle: 'Ручная заявка',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      });
      return NextResponse.json({ success: true, leadId: lead.id });
    }
  } catch (error) {
    console.error('[ManualOrder] Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
