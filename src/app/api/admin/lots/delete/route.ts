import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { lotId } = await request.json()

    if (!lotId) {
      return NextResponse.json({ error: 'ID лота обязателен' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase.from('Skupka').delete().eq('id', lotId)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json({ error: 'Ошибка удаления лота' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Лот успешно удален' })
  } catch (error) {
    console.error('Delete lot error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
