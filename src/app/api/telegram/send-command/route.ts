import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const { telegramId, command, message } =
      await req.json()

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
                  text: '🚀 Открыть приложение',
                  web_app: {
                    url: 'https://t.me/QRepairBot/QRepairDev',
                  },
                },
              ],
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
            request_write_access: true,
          },
        }
      )
    } else if (command) {
      await sendTelegramMessage(telegramId, command, {
        parse_mode: 'Markdown',
      })
    } else if (message) {
      await sendTelegramMessage(telegramId, message, {
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
