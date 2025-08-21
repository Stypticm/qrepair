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
            orderBy: { createdAt: 'desc' },
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
          { parse_mode: 'Markdown' }
        )
      } else if (data?.startsWith('price_confirm_yes:')) {
        const id = data.split(':')[1]
        if (id) {
          try {
            await prisma.skupka.update({
              where: { id },
              data: { priceConfirmed: true },
            })
          } catch (e) {}
          const updated = await prisma.skupka.findUnique({
            where: { id },
          })
          await sendTelegramMessage(
            telegramId,
            '✅ Спасибо за подтверждение. Ожидайте, с вами свяжется наш менеджер для организации забора устройства.',
            { parse_mode: 'Markdown' }
          )
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
            await sendTelegramMessage(
              telegramId,
              'Произошла ошибка при отмене заявки. Свяжитесь с поддержкой: @QtweRepairSupport',
              { parse_mode: 'Markdown' }
            )
          }
        }
      } else if (data?.startsWith('courier_time:')) {
        const [, id, time] = data.split(':')
        if (id && time) {
          const [hh, mm = '00'] = time
            .split(':')
            .map(Number)
          if (
            isNaN(hh) ||
            isNaN(mm) ||
            hh < 0 ||
            hh > 23 ||
            mm < 0 ||
            mm > 59
          ) {
            await sendTelegramMessage(
              telegramId,
              '❌ Неверный формат времени. Укажите HH:mm (например, 14:00).',
              { parse_mode: 'Markdown' }
            )
            return NextResponse.json(
              { error: 'Invalid time format' },
              { status: 400 }
            )
          }
          const now = new Date()
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          )
          const scheduled = new Date(today)
          scheduled.setHours(hh, mm, 0, 0)

          await prisma.skupka.update({
            where: { id },
            data: {
              courierTimeSlot: `${hh
                .toString()
                .padStart(2, '0')}:${mm
                .toString()
                .padStart(2, '0')}`,
              courierScheduledAt: scheduled,
              courierUserConfirmed: true,
              courierTimeSlotSent: true,
            },
          })

          const reqForPrice =
            await prisma.skupka.findUnique({
              where: { id },
            })
          const priceText =
            typeof reqForPrice?.price === 'number'
              ? `${Math.round(reqForPrice.price)} ₽`
              : '—'
          // DEV: Отправляем только подтверждение выбора времени
          if (process.env.NODE_ENV !== 'production') {
            await sendTelegramMessage(
              telegramId,
              `✅ Время выбрано: ${time}. Мастер назначен.\n💰 Окончательная цена: ${priceText}.`,
              { parse_mode: 'Markdown' }
            )
          }
          // PROD: Комментируем для теста, раскомментируй для продакшена
          // else {
          //   await sendTelegramMessage(
          //     telegramId,
          //     `👨‍🔧 Мастер назначен для забора устройства.\n💰 Окончательная цена: ${priceText}.\n🕒 Выбор времени подтверждён: ${time}.`,
          //     { parse_mode: 'Markdown' }
          //   );
          // }
        }
      } else if (data === 'contact_support') {
        await sendTelegramMessage(
          telegramId,
          'Свяжитесь с поддержкой: @QtweRepairSupport',
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
