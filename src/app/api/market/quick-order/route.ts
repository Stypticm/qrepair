import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, productId, productTitle, price, telegramId, address, deliveryDate, deliveryTime } = body;

        console.log(`[QuickOrder] Request for ${productTitle} from ${telegramId || 'GUEST'}, phone: ${phone}`);

        if (!phone || !name) {
            return NextResponse.json(
                { error: 'Имя и телефон обязательны' },
                { status: 400 }
            );
        }

        const lead = await api.create<any>('quick-leads', {
            name,
            phone,
            productId: productId || null,
            productTitle: productTitle || null,
            price: price ? Number(price) : null,
            telegramId: telegramId ? telegramId.toString() : null,
            address: address || null,
            deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
            deliveryTime: deliveryTime || null,
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            leadId: lead.id
        });
    } catch (error) {
        console.error('Error creating quick lead:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
