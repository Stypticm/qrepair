import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const { telegramId, command } = await req.json()

    if (!telegramId || !command) {
      return NextResponse.json(
        { error: 'Missing telegramId or command' },
        { status: 400 }
      )
    }

    if (command === '/start') {
      await sendTelegramMessage(
        telegramId,
        'Добро пожаловать в QtweRepair! 📱\nВыберите действие:',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Проверить статус',
                  callback_data: 'check_status',
                },
              ],
              [
                {
                  text: 'Связаться с поддержкой',
                  callback_data: 'contact_support',
                },
              ],
            ],
          },
        }
      )
    } else {
      await sendTelegramMessage(telegramId, command, {
        parse_mode: 'Markdown',
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending command:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
