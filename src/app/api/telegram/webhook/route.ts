import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function POST(req: Request) {
  try {
    const update = await req.json()
    const message = update.message
    const callbackQuery = update.callback_query

    const secretToken = req.headers.get(
      'X-Telegram-Bot-Api-Secret-Token'
    )
    if (
      secretToken &&
      secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (callbackQuery) {
      const telegramId = callbackQuery.from.id.toString()
      const data = callbackQuery.data

      if (data === 'check_status') {
        const skupkaRequest = await prisma.skupka.findFirst(
          {
            where: {
              telegramId,
              status: {
                in: [
                  'draft',
                  'accepted',
                  'in_progress',
                  'paid',
                  'on_the_way',
                ],
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          }
        )

        const responseText = skupkaRequest
          ? `Статус вашей заявки: *${
              skupkaRequest.status === 'draft'
                ? 'Черновик'
                : skupkaRequest?.status === 'accepted'
                ? `Принята, предварительная цена ${skupkaRequest.price}`
                : skupkaRequest?.status === 'in_progress'
                ? 'На проверке'
                : skupkaRequest?.status === 'on_the_way'
                ? 'В пути'
                : skupkaRequest?.status === 'paid'
                ? 'Оплачено'
                : 'Выполнена'
            }*`
          : 'У вас нет активных заявок.'

        await sendTelegramMessage(
          telegramId,
          responseText,
          {
            parse_mode: 'Markdown',
          }
        )
      } else if (data?.startsWith('price_confirm_yes:')) {
        const id = data.split(':')[1]
        if (id) {
          // подтверждение цены: ставим флаг подтверждения и информируем
          try {
            await prisma.skupka.update({
              where: { id },
              data: { priceConfirmed: true },
            })
          } catch (e) {
            // ignore if already confirmed or missing
          }
          const updated = await prisma.skupka.findUnique({
            where: { id },
          })
          await sendTelegramMessage(
            telegramId,
            '✅ Спасибо за подтверждение. Ожидайте, с вами свяжется наш менеджер для организации забора устройства (в ближайшее время).',
            { parse_mode: 'Markdown' }
          )
          // Подтолкнуть фронтенд к обновлению через webhook: опционально можно дернуть сторонний канал (сейчас пропускаем)
        }
      } else if (data?.startsWith('price_confirm_no:')) {
        const id = data.split(':')[1]
        if (id) {
          try {
            await prisma.skupka.delete({ where: { id } })
            await sendTelegramMessage(
              telegramId,
              '❌ Спасибо, что воспользовались нашим сервисом. Заявка отменена.',
              { parse_mode: 'Markdown' }
            )
          } catch (e) {
            // если уже удалена или некорректный id
            await sendTelegramMessage(
              telegramId,
              'Произошла ошибка при отмене заявки. Пожалуйста, свяжитесь с поддержкой: @QtweRepairSupport',
              { parse_mode: 'Markdown' }
            )
          }
        }
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
      const skupkaRequest = await prisma.skupka.findFirst({
        where: {
          telegramId,
          status: {
            in: [
              'draft',
              'accepted',
              'in_progress',
              'paid',
              'on_the_way',
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const responseText = skupkaRequest
        ? `Статус вашей заявки: *${
            skupkaRequest.status === 'draft'
              ? 'Черновик'
              : skupkaRequest?.status === 'accepted'
              ? `Принята, предварительная цена ${skupkaRequest.price}`
              : skupkaRequest?.status === 'in_progress'
              ? 'На проверке'
              : skupkaRequest?.status === 'on_the_way'
              ? 'В пути'
              : skupkaRequest?.status === 'paid'
              ? 'Оплачено'
              : 'Выполнена'
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
