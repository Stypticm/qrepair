import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: 'ID заявки обязателен' }, { status: 400 })
    }

    const deletedRequest = await prisma.skupka.delete({ where: { id: requestId } })

    console.log('🗑️ Admin deleted request:', { id: deletedRequest.id, telegramId: deletedRequest.telegramId, status: deletedRequest.status })

    return NextResponse.json({
      success: true,
      message: 'Заявка успешно удалена',
      deletedRequest: { id: deletedRequest.id, telegramId: deletedRequest.telegramId, status: deletedRequest.status },
    })
  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
