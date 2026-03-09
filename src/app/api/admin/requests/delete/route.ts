import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: 'ID заявки обязателен' }, { status: 400 })
    }

    // Удаляем заявку через Go API
    const deletedRequest = await api.delete('skupkas', requestId);

    console.log('🗑️ Admin deleted request:', { id: requestId })

    return NextResponse.json({
      success: true,
      message: 'Заявка успешно удалена',
      deletedRequest: { id: requestId },
    })
  } catch (error: any) {
    console.error('Delete request error:', error)
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
