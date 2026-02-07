import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/core/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
    // Debug: Check env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase Environment Variables (Service Role)');
        return NextResponse.json({ 
            error: 'Configuration Error',
            details: 'Missing Supabase URL or Service Key'
        }, { status: 500 });
    }

    try {
        // Use native crypto.randomUUID() for reliability
        const requestId = crypto.randomUUID();
        console.log(`[AUTH_QR] Attempting insertion with ID: ${requestId}`);

        const { error } = await supabaseAdmin
            .from('auth_requests')
            .insert({
                id: requestId,
                status: 'pending'
            });

        if (error) {
            console.error('[AUTH_QR] Database Insertion Error:');
            console.dir(error, { depth: null });
            
            // Log specific error codes for debugging
            if (error.code === '42P01') console.error('[AUTH_QR] TABLE NOT FOUND! Check if "auth_requests" exists in "public" schema.');
            if (error.code === '23505') console.error('[AUTH_QR] Duplicate ID? (Highly unlikely with UUID)');
            if (error.code === '42703') console.error('[AUTH_QR] Column mismatch! Check "id" or "status" column names.');

            return NextResponse.json({ 
                error: 'Database Insertion Error', 
                message: error.message,
                code: error.code,
                hint: error.hint,
                details: error.details
            }, { status: 500 });
        }

        console.log(`[AUTH_QR] Success! Request created: ${requestId}`);
        return NextResponse.json({ uuid: requestId });
    } catch (error: any) {
        console.error('[AUTH_QR] Unexpected Server Error:', error);
        return NextResponse.json({ 
            error: 'Unexpected Server Error', 
            message: error.message || 'Unknown error',
            name: error.name
        }, { status: 500 });
    }
}
