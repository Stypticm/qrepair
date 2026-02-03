import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/core/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
    // Debug: Check env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase Environment Variables (Service Role)');
        return NextResponse.json({ 
            error: 'Configuration Error: Missing Supabase URL or Service Key',
            details: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        }, { status: 500 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('auth_requests')
            .insert({}) // ID and created_at are default
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        return NextResponse.json({ uuid: data.id });
    } catch (error: any) {
        console.error('Error creating auth request:', error);
        return NextResponse.json({ 
            error: 'Database Error', 
            message: error.message || 'Unknown error',
            details: error
        }, { status: 500 });
    }
}
