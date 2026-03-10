import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: Request) {
  try {
    // Optional auth for cron invocations
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth =
        req.headers.get('authorization') ||
        req.headers.get('Authorization') ||
        '';
      if (auth !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const inOneHour = new Date(
      now.getTime() + 60 * 60 * 1000
    );

    // Find requests not reminded yet; filter by courier JSON time in code
    const raw = await api.list<any>('skupkas', { courierReminderSent: 'false', _sort: 'createdAt', _order: 'asc' });

    const toRemind = (raw || []).filter((app: any) => {
      const c = (app.courier || {}) as any;
      const scheduledAt = c.scheduledAt
        ? new Date(c.scheduledAt)
        : null;
      return (
        !!scheduledAt &&
        scheduledAt.getTime() > now.getTime() &&
        scheduledAt.getTime() <= inOneHour.getTime()
      );
    });

    if (!toRemind.length) {
      return NextResponse.json({
        success: true,
        reminded: 0,
      });
    }

    let sentCount = 0;
    // Отправка сообщений в Telegram отключена
    
    for (const app of toRemind) {
       await api.patch<any>('skupkas', app.id, { 
           courierReminderSent: true,
           updatedAt: new Date().toISOString()
       });
    }

    return NextResponse.json({
      success: true,
      reminded: toRemind.length,
      sentCount,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Server error', details: String(e) },
      { status: 500 }
    );
  }
}
