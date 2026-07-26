import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
        return NextResponse.json({ error: 'guestId is required' }, { status: 400 });
    }

    try {
        // Делаем прокси-запрос к нашему telegram_bot.js, который теперь работает и как HTTP-сервер на 8002 порту
        const res = await fetch(`http://127.0.0.1:8002/poll?guestId=${guestId}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[ChatPoll] Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
