import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sirena-eriophyllous-melisa.ngrok-free.dev';

export async function POST(req: Request) {
  try {
    let login: string | undefined;
    let password: string | undefined;

    try {
      const body = await req.json();
      login = body?.login;
      password = body?.password;
    } catch (parseError) {
      console.error('[AUTH] Register: invalid JSON body', parseError);
      return NextResponse.json(
        { error: 'Некорректное тело запроса' },
        { status: 400 }
      );
    }

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Прокидываем регистрацию напрямую в Go API
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ login, password }),
    });

    const text = await res.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[AUTH] Register: failed to parse Go response as JSON, raw:', text);
        // Если ответ не JSON, но статус успешный — всё равно считаем регистрацию успешной
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'Не удалось создать пользователя' },
        { status: res.status }
      );
    }

    // Если Go не вернул токен/пользователя (например, 201 без тела),
    // просто сообщаем фронту, что регистрация прошла успешно.
    if (!data.token || !data.user) {
      return NextResponse.json(
        { success: true },
        { status: 201 },
      );
    }

    // Ожидаемый сценарий: Go вернул token и user так же, как в /api/users/login
    return NextResponse.json({
      token: data.token,
      user: data.user,
    });

  } catch (error: any) {
    console.error('[AUTH] Register Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера', message: error.message },
      { status: 500 }
    );
  }
}

