import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { checkRole } from '@/core/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            name, 
            phone, 
            address, 
            deliveryDate, 
            deliveryTime, 
            adminTelegramId,
            items, // Optional array of lot IDs/titles
            totalPrice
        } = body;

        const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!phone || !name) {
            return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 });
        }

        // We can create either a Lead or a full Order.
        // If items are provided, we create an Order. Otherwise a QuickLead.
        if (items && items.length > 0) {
            const order = await prisma.order.create({
                data: {
                    telegramId: phone, // Using phone as ID for manual orders if not provided
                    deliveryMethod: 'courier',
                    deliveryAddress: address || 'Ручное создание',
                    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                    deliveryTime: deliveryTime || null,
                    status: 'pending',
                    totalPrice: totalPrice || 0,
                    items: {
                        create: items.map((item: any) => ({
                            title: item.title,
                            price: item.price,
                            lot: { connect: { id: item.lotId } }
                        }))
                    }
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
