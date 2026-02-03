import { NextResponse } from 'next/server';
import { supabase } from '@/core/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const { data, error } = await supabase
            .from('auth_requests')
            .insert({}) // ID and created_at are default
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ uuid: data.id });
    } catch (error) {
        console.error('Error creating auth request:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
