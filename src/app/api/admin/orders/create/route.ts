import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

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
      const order = await prisma.order.create({
        data: {
          telegramId: phone,
          deliveryMethod: 'courier',
          deliveryAddress: address || 'Ручное создание',
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          deliveryTime: deliveryTime || null,
          status: 'pending',
          totalPrice: totalPrice || 0,
          items: { create: items.map((item: any) => ({ title: item.title, price: item.price, lot: { connect: { id: item.lotId } } })) }
        }
      });
      return NextResponse.json({ success: true, orderId: order.id });
    } else {
      const lead = await prisma.quickLead.create({
        data: {
          name,
          phone,
          address: address || 'Ручное создание',
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          deliveryTime: deliveryTime || null,
          status: 'new',
          productTitle: 'Ручная заявка',
        }
      });
      return NextResponse.json({ success: true, leadId: lead.id });
    }
  } catch (error) {
    console.error('[ManualOrder] Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
