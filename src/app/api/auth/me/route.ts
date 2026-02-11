import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // убираем "Bearer "
    
    // Проверяем токен
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Невалидный токен' },
        { status: 401 }
      );
    }

    // Получаем актуальные данные пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        telegramId: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[AUTH] Me Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера', message: error.message },
      { status: 500 }
    );
  }
}
