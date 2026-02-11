import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, minPrice, maxPrice } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updated = await prisma.tradeInEvaluation.update({
            where: { id },
            data: {
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating price:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
