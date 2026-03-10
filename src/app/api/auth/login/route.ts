import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sirena-eriophyllous-melisa.ngrok-free.dev';

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Вызываем Go API для аутентификации
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Неверный логин или пароль' },
        { status: res.status }
      );
    }

    // Возвращаем токен и данные пользователя от Go API
    return NextResponse.json({
      token: data.token,
      user: data.user,
    });
  } catch (error: any) {
    console.error('[AUTH] Login Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера', message: error.message },
      { status: 500 }
    );
  }
}
