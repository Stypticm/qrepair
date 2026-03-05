import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    const cleanUsername = username.startsWith('@') ? username.slice(1) : username

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=@${cleanUsername}`)

      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.result) {
          return NextResponse.json({
            success: true,
            telegramId: data.result.id,
            username: cleanUsername,
            type: data.result.type,
            title: data.result.title || data.result.first_name || cleanUsername,
          })
        }
      }

      return NextResponse.json({
        success: false,
        error: 'User not found or not accessible',
        message: 'Пользователь не найден через Telegram API. Для получения ID попросите пользователя написать боту @userinfobot в Telegram.',
      })
    } catch (telegramError) {
      return NextResponse.json({ success: false, error: 'Telegram API error', message: 'Ошибка при обращении к Telegram API.' })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
