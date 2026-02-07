import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Use native crypto.randomUUID()
        const requestId = crypto.randomUUID();
        console.log(`[AUTH_QR] Creating request via Prisma: ${requestId}`);

        const result = await prisma.authRequest.create({
            data: {
                id: requestId,
                status: 'pending'
            }
        });

        console.log(`[AUTH_QR] Success! Request created: ${result.id}`);
        return NextResponse.json({ uuid: result.id });
    } catch (error: any) {
        console.error('[AUTH_QR] Prisma Creation Error:', error);
        
        // P2002 is unique constraint violation, P2003 is foreign key, etc.
        return NextResponse.json({ 
            error: 'Database Error', 
            message: error.message || 'Failed to create auth request',
            code: error.code
        }, { status: 500 });
    }
}
