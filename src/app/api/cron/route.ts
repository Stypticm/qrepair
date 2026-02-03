import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const auth =
        req.headers.get('authorization') ||
        req.headers.get('Authorization') ||
        ''
      const url = new URL(req.url)
      const qp = url.searchParams.get('secret') || ''
      const ok =
        auth === `Bearer ${cronSecret}` || qp === cronSecret
      if (!ok) {
        return NextResponse.json(
          { ok: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    const now = new Date()
    // DEV: 1 минута, PROD: 30/60 минут (оставлено закомментированным)
    const inOneMinute = new Date(
      now.getTime() + 1 * 60 * 1000
    )
    const inThirtyMinutes = new Date(
      now.getTime() + 30 * 60 * 1000
    )
    const inOneHour = new Date(
      now.getTime() + 60 * 60 * 1000
    )

    const raw = await prisma.skupka.findMany({
      where: { courierReminderSent: false as any } as any,
      orderBy: { createdAt: 'asc' },
    })

    const upperBound =
      process.env.NODE_ENV !== 'production'
        ? inOneMinute
        : inOneHour

    const toRemind = raw.filter((app) => {
      const c = ((app as any).courier || {}) as any
      const scheduledAt = c.scheduledAt
        ? new Date(c.scheduledAt)
        : null
      return (
        !!scheduledAt &&
        scheduledAt.getTime() > now.getTime() &&
        scheduledAt.getTime() <= upperBound.getTime()
      )
    })

    if (!toRemind.length) {
      return NextResponse.json({ ok: true, reminded: 0 })
    }

    const adminIdsEnv =
      process.env.ADMIN_NOTIFY_TELEGRAM_IDS ||
      process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_IDS ||
      ''
    const adminIds = adminIdsEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (
      adminIds.length === 0 &&
      process.env.NODE_ENV !== 'production'
    ) {
      adminIds.push('531360988')
    }

    let sentCount = 0
    // TEMPORARILY DISABLED on User Request (GitHub Error Fix)
    // for (const app of toRemind) {
    //   const c = ((app as any).courier || {}) as any
    //   const hhmm =
    //     c.timeSlot ||
    //     (c.scheduledAt
    //       ? new Date(c.scheduledAt)
    //           .toISOString()
    //           .substring(11, 16)
    //       : '')
    //   const msg =
    //     (process.env.NODE_ENV !== 'production'
    //       ? `⏰ DEV: Напоминание: через ~1 минут визит мастера.\n`
    //       : `⏰ Напоминание: через ~1 час визит мастера.\n`) +
    //     `Заявка: ${app.id}\n` +
    //     `Модель: ${app.modelname || '—'}\n` +
    //     `Время: ${hhmm || '—'}\n` +
    //     `Мастер TG: ${c.telegramId || '—'}\n` +
    //     `Свяжитесь с мастером и подтвердите выезд к клиенту.`

    //   // PROD: Доп. вариант за 30 минут (закомментирован для продакшена)
    //   // if (process.env.NODE_ENV === 'production' && app.courierScheduledAt && app.courierReminder30mSent !== true) {
    //   //   if (app.courierScheduledAt.getTime() - now.getTime() <= 30 * 60 * 1000) {
    //   //     // отправить напоминание за 30 минут
    //   //   }
    //   // }
    //   for (const adminId of adminIds) {
    //     try {
    //       await sendTelegramMessage(adminId, msg, {
    //         parse_mode: 'Markdown',
    //       })
    //       sentCount++
    //     } catch {}
    //   }
    //   await prisma.skupka.update({
    //     where: { id: app.id },
    //     data: { courierReminderSent: true } as any,
    //   })
    // }

    return NextResponse.json({
      ok: true,
      reminded: toRemind.length,
      sentCount,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    )
  }
}
