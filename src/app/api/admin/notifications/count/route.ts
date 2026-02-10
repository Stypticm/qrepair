import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { isAdminTelegramId } from '@/core/lib/admin';

export async function GET(request: NextRequest) {
    try {
        // Authenticate as Admin
        const initData = request.headers.get('x-telegram-init-data')
        let userId: string | null = null

        if (initData) {
            const params = new URLSearchParams(initData)
            const userStr = params.get('user')
            if (userStr) {
                const user = JSON.parse(userStr)
                userId = user.id?.toString()
            }
        }

        // Fallback for browser/local testing if initData is missing
        if (!userId) {
            userId = request.headers.get('x-telegram-id')
        }

        if (!userId || !isAdminTelegramId(userId)) {
            return NextResponse.json({ count: 0 }); // Silent for non-admins
        }

        // Count unread quick leads
        const unreadLeadsCount = await prisma.quickLead.count({
            where: { isRead: false }
        });

        // Count pending shop requests (Skupka) - for completeness
        const newSkupkaCount = await prisma.skupka.count({
            where: { status: 'submitted' }
        });

        // Total unread notifications
        const total = unreadLeadsCount + newSkupkaCount;

        return NextResponse.json({
            count: total,
            leads: unreadLeadsCount,
            skupka: newSkupkaCount
        });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return NextResponse.json({ count: 0 });
    }
}
