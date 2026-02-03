import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/core/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
        return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('auth_requests')
            .select('status, telegram_id, telegram_username, telegram_data')
            .eq('id', uuid)
            .single();

        if (error) {
            // If row not found (e.g. invalid UUID)
            return NextResponse.json({ status: 'not_found' });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error checking auth status:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
