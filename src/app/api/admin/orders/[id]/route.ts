import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { checkRole } from '@/core/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { deliveryAddress, address, deliveryDate, deliveryTime, courierId, adminTelegramId, status } = body;

        const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data: any = {};
        if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;
        if (address !== undefined) data.deliveryAddress = address;
        if (deliveryDate !== undefined) data.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
        if (deliveryTime !== undefined) data.deliveryTime = deliveryTime;
        if (status !== undefined) data.status = status;
        if (courierId !== undefined) {
            data.assignedCourier = courierId ? { connect: { id: courierId } } : { disconnect: true };
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data,
            include: { items: true, assignedCourier: true }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('[OrderUpdate] Error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
