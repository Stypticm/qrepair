import { NextResponse } from 'next/server';
import { api } from '@/services/api';
import { hashPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await api.list<any>('users', { telegramId: login });

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким логином уже существует' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = await api.create<any>('users', {
        telegramId: login,
        passwordHash: passwordHash,
        role: 'USER', // Default role
    });

    // Generate JWT token
    const token = await createToken({
      userId: newUser.id,
      telegramId: newUser.telegramId,
      role: newUser.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        telegramId: newUser.telegramId,
        role: newUser.role,
      },
    });

  } catch (error: any) {
    console.error('[AUTH] Register Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера', message: error.message },
      { status: 500 }
    );
  }
}
