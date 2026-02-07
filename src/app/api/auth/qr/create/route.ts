import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/core/lib/supabase-admin';
import { v4 as uuidv4 } from 'uuid';

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
        const requestId = uuidv4();
        console.log(`Creating auth request with ID: ${requestId}`);

        const { data, error } = await supabaseAdmin
            .from('auth_requests')
            .insert({
                id: requestId,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Insertion Error:');
            console.dir(error, { depth: null });
            return NextResponse.json({ 
                error: 'Database Insertion Error', 
                message: error.message,
                details: error
            }, { status: 500 });
        }

        return NextResponse.json({ uuid: requestId });
    } catch (error: any) {
        console.error('Unexpected Error in Auth QR Create:', error);
        return NextResponse.json({ 
            error: 'Unexpected Server Error', 
            message: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
