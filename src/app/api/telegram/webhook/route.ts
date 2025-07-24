import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const update = await req.json()
    const message = update.message
    const callbackQuery = update.callback_query

    if (callbackQuery) {
      const telegramId = callbackQuery.from.id.toString()
      const data = callbackQuery.data

      if (data === 'check_status') {
        const repairRequest =
          await prisma.repairRequest.findFirst({
            where: {
              telegramId,
              status: {
                in: [
                  'draft',
                  'submitted',
                  'in_progress',
                  'completed',
                ],
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })

        const responseText = repairRequest
          ? `Статус вашей заявки: *${
              repairRequest.status === 'submitted'
                ? 'Ожидает обработки'
                : repairRequest.status === 'in_progress'
                ? 'В работе'
                : 'Завершена'
            }*`
          : 'У вас нет активных заявок.'

        await sendTelegramMessage(
          telegramId,
          responseText,
          { parse_mode: 'Markdown' }
        )
      } else if (data === 'contact_support') {
        await sendTelegramMessage(
          telegramId,
          'Свяжитесь с нашей поддержкой: @QtweRepairSupport',
          { parse_mode: 'Markdown' }
        )
      }

      return NextResponse.json({ ok: true })
    }

    const telegramId = message?.chat?.id.toString()
    const text = message?.text

    if (!telegramId || !text) {
      console.error('Invalid update:', update)
      return NextResponse.json(
        { error: 'Invalid update' },
        { status: 400 }
      )
    }

    if (text === '/start') {
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
                    url: 'https://qrepair-git-dev-stypticms-projects.vercel.app',
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
          },
        }
      )
    } else if (text === '/status') {
      const repairRequest =
        await prisma.repairRequest.findFirst({
          where: {
            telegramId,
            status: {
              in: ['submitted', 'in_progress', 'completed'],
            },
          },
          orderBy: { createdAt: 'desc' },
        })

      const responseText = repairRequest
        ? `Статус вашей заявки: *${
            repairRequest.status === 'submitted'
              ? 'Ожидает обработки'
              : repairRequest.status === 'in_progress'
              ? 'В работе'
              : 'Завершена'
          }*`
        : 'У вас нет активных заявок.'

      await sendTelegramMessage(telegramId, responseText, {
        parse_mode: 'Markdown',
      })
    } else {
      await sendTelegramMessage(
        telegramId,
        'Неизвестная команда. Используйте /start для начала.',
        { parse_mode: 'Markdown' }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
