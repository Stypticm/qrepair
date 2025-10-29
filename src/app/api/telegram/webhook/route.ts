import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import {
  sendTelegramMessage,
  editTelegramReplyMarkup,
  answerCallbackQuery,
} from '@/core/lib/sendTelegramMessage'

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
      const callbackId = callbackQuery.id
      const messageId = callbackQuery.message?.message_id

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

          // Удаляем клавиатуру под исходным сообщением
          if (messageId) {
            try {
              await editTelegramReplyMarkup(
                telegramId,
                messageId,
                null
              )
            } catch {}
          }

          await sendTelegramMessage(
            telegramId,
            '✅ Вы нажали "Да". Спасибо за подтверждение. Ожидайте, с вами свяжется наш менеджер для организации забора устройства.',
            { parse_mode: 'Markdown' }
          )
        }
      } else if (data?.startsWith('price_confirm_no:')) {
        const id = data.split(':')[1]
        if (id) {
          try {
            await prisma.skupka.delete({ where: { id } })

            // Удаляем клавиатуру под исходным сообщением
            if (messageId) {
              try {
                await editTelegramReplyMarkup(
                  telegramId,
                  messageId,
                  null
                )
              } catch {}
            }

            await sendTelegramMessage(
              telegramId,
              '❌ Вы нажали "Нет". Спасибо, что воспользовались нашим сервисом. Заявка отменена.',
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

          // Не даём выбрать время повторно
          const existing = await prisma.skupka.findUnique({
            where: { id },
          })
          if ((existing as any)?.courierUserConfirmed) {
            await sendTelegramMessage(
              telegramId,
              '⏱️ Время уже подтверждено. Изменение через поддержку: @QtweRepairSupport',
              { parse_mode: 'Markdown' }
            )
            return NextResponse.json({ ok: true })
          }

          await prisma.skupka.update({
            where: { id },
            data: {
              courier: {
                set: {
                  ...(((existing as any) || {}).courier ||
                    {}),
                  timeSlot: `${hh
                    .toString()
                    .padStart(2, '0')}:${mm
                    .toString()
                    .padStart(2, '0')}`,
                  scheduledAt: scheduled.toISOString(),
                  userConfirmed: true,
                  timeSlotSent: true,
                },
              },
            } as any,
          })

          // Отправляем уведомление мастеру о выбранном времени
          const masterNotification =
            await prisma.skupka.findUnique({
              where: { id },
            })

          const courierData = ((
            (masterNotification as any) || {}
          ).courier || {}) as any
          if (courierData?.telegramId) {
            const deviceInfo =
              masterNotification?.modelname || 'Не указано'
            const priceInfo = masterNotification?.price
              ? `${Math.round(masterNotification.price)} ₽`
              : 'Не указана'

            await sendTelegramMessage(
              courierData.telegramId,
              `👨‍🔧 Вам назначена встреча!\n\n📱 Устройство: ${deviceInfo}\n💰 Цена: ${priceInfo}\n🕒 Время встречи: ${time}\n\nКлиент ожидает вас в указанное время для проверки устройства.`,
              { parse_mode: 'Markdown' }
            )
          }

          const reqForPrice =
            await prisma.skupka.findUnique({
              where: { id },
            })
          const priceText =
            typeof reqForPrice?.price === 'number'
              ? `${Math.round(reqForPrice.price)} ₽`
              : '—'
          // Удаляем клавиатуру под исходным сообщением выбора времени
          if (messageId) {
            try {
              await editTelegramReplyMarkup(
                telegramId,
                messageId,
                null
              )
            } catch {}
          }

          // Удаляем сообщение "Назначен мастер. Выберите удобное время (для теста):"
          // Просто удаляем текущее сообщение с клавиатурой
          // Это сообщение будет заменено новым

          // DEV: упрощённое подтверждение
          if (process.env.NODE_ENV !== 'production') {
            // Удаляем старое сообщение и отправляем новое
            try {
              await fetch(
                `https://api.telegram.org/bot${process.env.BOT_TOKEN}/deleteMessage`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    chat_id: telegramId,
                    message_id: messageId,
                  }),
                }
              )
            } catch {}

            await sendTelegramMessage(
              telegramId,
              `👨‍🔧 Мастер назначен.\n🕒 Время выбрано: ${time}.\n💰 Окончательная цена: ${priceText}.\n\nМастер свяжется с вами в указанное время для проверки устройства.`,
              { parse_mode: 'Markdown' }
            )
          } else {
            // PROD: отправляем финальное подтверждение с временем
            await sendTelegramMessage(
              telegramId,
              `👨‍🔧 Мастер назначен.\n🕒 Время выбрано: ${time}.\n💰 Окончательная цена: ${priceText}.\n\nМастер свяжется с вами в указанное время для проверки устройства.`,
              { parse_mode: 'Markdown' }
            )
          }

          // Подтверждаем callback, чтобы Telegram убрал "часики"
          try {
            await answerCallbackQuery(callbackId)
          } catch {}
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

    const telegramId = message?.chat?.id?.toString()
    const text = message?.text

    if (!telegramId || !text) {
      // Ничего полезного, просто подтверждаем обработку
      return NextResponse.json({ ok: true })
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
