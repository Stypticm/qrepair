import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';
import { checkAdminAccessFromDB } from '@/core/lib/admin-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const telegramId = request.headers.get('x-telegram-id') || url.searchParams.get('telegramId');

        if (!telegramId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const access = await checkAdminAccessFromDB(telegramId);
        if (!access.hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Параллельный подсчет метрик для новых заявок
        const [newRepairs, newTradeIns, newOrders] = await Promise.all([
            // Новые ремонты (created)
            prisma.repairRequest.count({
                where: { status: 'created' }
            }),
            
            // Новые скупки/trade-in (draft)
            prisma.skupka.count({
                where: { status: 'draft' }
            }),
            
            // Новые заказы (pending)
            prisma.order.count({
                where: { status: 'pending' }
            })
        ]);

        return NextResponse.json({
            metrics: {
                totalNew: newRepairs + newTradeIns + newOrders,
                repairs: newRepairs,
                tradeIns: newTradeIns,
                orders: newOrders,
            }
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
