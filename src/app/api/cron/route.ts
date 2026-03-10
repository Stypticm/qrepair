import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth =
        req.headers.get('authorization') ||
        req.headers.get('Authorization') ||
        '';
      const url = new URL(req.url);
      const qp = url.searchParams.get('secret') || '';
      const ok =
        auth === `Bearer ${cronSecret}` || qp === cronSecret;
      if (!ok) {
        return NextResponse.json(
          { ok: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    const now = new Date();
    // DEV: 1 минута, PROD: 30/60 минут (оставлено закомментированным)
    const inOneMinute = new Date(
      now.getTime() + 1 * 60 * 1000
    );
    const inOneHour = new Date(
      now.getTime() + 60 * 60 * 1000
    );

    const raw = await api.list<any>('skupkas', { courierReminderSent: 'false', _sort: 'createdAt', _order: 'asc' });

    const upperBound =
      process.env.NODE_ENV !== 'production'
        ? inOneMinute
        : inOneHour;

    const toRemind = (raw || []).filter((app: any) => {
      const c = (app.courier || {}) as any;
      const scheduledAt = c.scheduledAt
        ? new Date(c.scheduledAt)
        : null;
      return (
        !!scheduledAt &&
        scheduledAt.getTime() > now.getTime() &&
        scheduledAt.getTime() <= upperBound.getTime()
      );
    });

    if (!toRemind.length) {
      return NextResponse.json({ ok: true, reminded: 0 });
    }

    let sentCount = 0;
    // Отправка сообщений в Telegram отключена по просьбе пользователя
    // Только помечаем как отправленные

    for (const app of toRemind) {
       await api.patch<any>('skupkas', app.id, { 
           courierReminderSent: true,
           updatedAt: new Date().toISOString()
       });
       // sentCount++ if we were actually sending
    }

    return NextResponse.json({
      ok: true,
      reminded: toRemind.length,
      sentCount,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
