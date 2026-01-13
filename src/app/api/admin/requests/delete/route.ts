import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'ID заявки обязателен' },
        { status: 400 }
      )
    }

    // Проверяем права доступа
    const telegramId = request.headers.get('x-telegram-id')
    const adminIds = ['1', '296925626', '531360988']

    if (!telegramId || !adminIds.includes(telegramId)) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // Удаляем заявку
    const deletedRequest = await prisma.skupka.delete({
      where: { id: requestId },
    })

    console.log('🗑️ Admin deleted request:', {
      id: deletedRequest.id,
      telegramId: deletedRequest.telegramId,
      status: deletedRequest.status,
    })

    return NextResponse.json({
      success: true,
      message: 'Заявка успешно удалена',
      deletedRequest: {
        id: deletedRequest.id,
        telegramId: deletedRequest.telegramId,
        status: deletedRequest.status,
      },
    })
  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
