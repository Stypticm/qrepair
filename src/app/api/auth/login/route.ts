import { NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Ищем пользователя по telegramId (который используется как логин)
    const user = await prisma.user.findUnique({
      where: { telegramId: login },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Создаем JWT токен
    const token = createToken({
      userId: user.id,
      telegramId: user.telegramId,
      role: user.role,
    });

    // Возвращаем токен и данные пользователя
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[AUTH] Login Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера', message: error.message },
      { status: 500 }
    );
  }
}
