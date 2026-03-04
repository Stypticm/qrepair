import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';

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

        // Create the lead in the database
        const lead = await prisma.quickLead.create({
            data: {
                name,
                phone,
                productId: productId || null,
                productTitle: productTitle || null,
                price: price || null,
                telegramId: telegramId ? telegramId.toString() : null,
                address: address || null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                deliveryTime: deliveryTime || null,
                status: 'new'
            }
        });

        // NOTE: Here you could trigger a Telegram bot notification to the admin
        // For example: await bot.api.sendMessage(adminId, `Новый лид! ${name} ${phone} ...`);

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
