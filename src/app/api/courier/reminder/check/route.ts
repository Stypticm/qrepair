import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { sendTelegramMessage } from '@/core/lib/sendTelegramMessage'

export async function GET(req: Request) {
  try {
    // Optional auth for cron invocations
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const auth =
        req.headers.get('authorization') ||
        req.headers.get('Authorization') ||
        ''
      if (auth !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const now = new Date()
    const inOneHour = new Date(
      now.getTime() + 60 * 60 * 1000
    )

    // Find requests not reminded yet; filter by courier JSON time in code
    const raw = await prisma.skupka.findMany({
      where: { courierReminderSent: false as any } as any,
      orderBy: { createdAt: 'asc' },
    })

    const toRemind = raw.filter((app) => {
      const c = ((app as any).courier || {}) as any
      const scheduledAt = c.scheduledAt
        ? new Date(c.scheduledAt)
        : null
      return (
        !!scheduledAt &&
        scheduledAt.getTime() > now.getTime() &&
        scheduledAt.getTime() <= inOneHour.getTime()
      )
    })

    if (!toRemind.length) {
      return NextResponse.json({
        success: true,
        reminded: 0,
      })
    }

    const adminIdsEnv =
      process.env.ADMIN_NOTIFY_TELEGRAM_IDS ||
      process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_IDS ||
      ''
    const adminIds = adminIdsEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    // fallback single id if not configured
    if (
      adminIds.length === 0 &&
      process.env.NODE_ENV !== 'production'
    ) {
      adminIds.push('531360988')
    }

    let sentCount = 0
    // TEMPORARILY DISABLED on User Request
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
    //   for (const adminId of adminIds) {
    //     try {
    //       await sendTelegramMessage(adminId, msg, {
    //         parse_mode: 'Markdown',
    //       })
    //       sentCount++
    //     } catch (e) {
    //       // continue other admins
    //     }
    //   }
    //   await prisma.skupka.update({
    //     where: { id: app.id },
    //     data: { courierReminderSent: true } as any,
    //   })
    // }

    return NextResponse.json({
      success: true,
      reminded: toRemind.length,
      sentCount,
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Server error', details: String(e) },
      { status: 500 }
    )
  }
}
