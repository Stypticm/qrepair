import { NextResponse } from 'next/server';
import { supabase } from '@/core/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
    // Debug: Check env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase Environment Variables');
        return NextResponse.json({ 
            error: 'Configuration Error: Missing Supabase URL or Key',
            details: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        }, { status: 500 });
    }

    try {
        const { data, error } = await supabase
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
