import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username } = body

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Получаем Telegram ID через Telegram Bot API
    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      )
    }

    // Убираем @ если есть
    const cleanUsername = username.startsWith('@')
      ? username.slice(1)
      : username

    try {
      // Пытаемся получить информацию о пользователе через getChat
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getChat?chat_id=@${cleanUsername}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.result) {
          return NextResponse.json({
            success: true,
            telegramId: data.result.id,
            username: cleanUsername,
            type: data.result.type,
            title:
              data.result.title ||
              data.result.first_name ||
              cleanUsername,
          })
        }
      }

      // Если не удалось получить через getChat, пробуем через getUpdates
      // Это может сработать, если пользователь недавно взаимодействовал с ботом
      const updatesResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?limit=100`
      )

      if (updatesResponse.ok) {
        const updatesData = await response.json()
        if (updatesData.ok && updatesData.result) {
          for (const update of updatesData.result) {
            if (
              update.message?.from?.username ===
              cleanUsername
            ) {
              return NextResponse.json({
                success: true,
                telegramId: update.message.from.id,
                username: cleanUsername,
                type: 'user',
                title:
                  update.message.from.first_name ||
                  cleanUsername,
              })
            }
          }
        }
      }

      return NextResponse.json({
        success: false,
        error: 'User not found or not accessible',
        message:
          'Пользователь не найден через Telegram API. Для получения ID попросите пользователя написать боту @userinfobot в Telegram.',
      })
    } catch (telegramError) {
      return NextResponse.json({
        success: false,
        error: 'Telegram API error',
        message: 'Ошибка при обращении к Telegram API.',
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
